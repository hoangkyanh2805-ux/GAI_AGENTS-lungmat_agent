import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { parseContentInput, getBrand } from '../config/brands';
import { withBrandPersona } from '../llm/personas';
import { AnthropicClient } from '../integrations/AnthropicClient';
import { ApifyClient } from '../integrations/ApifyClient';
import { RAGStore } from '../rag/RAGStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';
import {
  parseContentPack,
  mockContentPack,
  formatContentReply,
  type ContentPack,
} from '../content/contentPack';
import { ImageClient, buildImagePrompt } from '../integrations/ImageClient';
import {
  createContentPackApprovals,
  sendContentApprovalDm,
} from '../content/contentApprovals';
import { formatTypefullyBundle } from '../integrations/TypefullyClient';

const JSON_SCHEMA_INSTRUCTION = `
Trả về ĐÚNG MỘT JSON object (không markdown ngoài JSON), schema:

{
  "telegram_brief": "string — Markdown, 200-400 từ, breakdown/education theo brand",
  "x_thread": "string — 5-7 tweets, mỗi tweet bắt đầu 1/ 2/ ... dòng riêng, <280 chars/tweet",
  "threads_post": "string — <=500 ký tự, 1 post standalone",
  "youtube_pack": {
    "title": "string — SEO YouTube Shorts",
    "description": "string — mô tả + CTA Telegram",
    "tags": ["string", "..."],
    "shorts_script": "string — BẮT BUỘC: script 45-60s, hook 3s đầu, có [0-3s HOOK] [on-screen] cues",
    "thumbnail_brief": "string — mô tả thumbnail"
  }
}

youtube_pack.shorts_script là field QUAN TRỌNG NHẤT — viết đủ chi tiết để quay Shorts.
`.trim();

export class ContentAgent implements SubAgent {
  readonly name = 'ContentAgent';
  readonly role: AgentRole = 'content';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const parsed = parseContentInput(message.content, message.payload);
    if ('error' in parsed) {
      return {
        status: 'error',
        reply: parsed.error,
        next_actions: ['/help'],
        agent: this.name,
        trace_id: ctx.trace_id,
      };
    }

    const { brand, topic } = parsed;
    const brandCfg = getBrand(brand);

    try {
      const researchQuery = `${topic} gold XAUUSD Fed DXY`;
      const { result: articles, duration_ms: researchMs } = await timed(() =>
        ApifyClient.scrapeNews(researchQuery, 5).catch(() => []),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'research_news',
        input: { brand, topic, query: researchQuery },
        output: { articles: articles.length, mock: ApifyClient.isMock() },
        duration_ms: researchMs,
      });

      const headlines =
        articles.length > 0
          ? articles
              .slice(0, 5)
              .map((a) => `- ${a.title}`)
              .join('\n')
          : '(no headlines — use topic only)';

      const ragHits = RAGStore.search(topic, 2);
      const ragSnippet = ragHits
        .map((r) => r.document.content)
        .join('\n')
        .slice(0, 1500);

      const userPrompt =
        `Brand: ${brandCfg.displayName}\nTopic: ${topic}\n\n` +
        `Research headlines:\n${headlines}\n\n` +
        (ragSnippet ? `RAG context:\n${ragSnippet}\n\n` : '') +
        `Generate the content pack JSON.`;

      let pack: ContentPack;
      const { result: rawJson, duration_ms: llmMs } = await timed(async () => {
        if (AnthropicClient.isMock()) return JSON.stringify(mockContentPack(brand, topic));
        return AnthropicClient.chat(
          [{ role: 'user', content: userPrompt }],
          {
            system: withBrandPersona(brand, 'content') + '\n\n' + JSON_SCHEMA_INSTRUCTION,
            maxTokens: 4096,
          },
        );
      });

      try {
        pack = parseContentPack(rawJson, brand, topic);
      } catch (parseErr) {
        FileLogger.error('[ContentAgent] JSON parse failed, using mock', parseErr);
        pack = mockContentPack(brand, topic);
      }

      addStep(ctx, {
        agent: this.name,
        action: 'generate_content_pack',
        input: { brand, topic },
        output: {
          shorts_chars: pack.youtube_pack.shorts_script.length,
          thread_chars: pack.x_thread.length,
        },
        duration_ms: llmMs,
      });

      // Image generation — non-blocking; failures logged, not fatal
      try {
        const imagePrompts = buildImagePrompt(
          brandCfg.displayName,
          topic,
          pack.youtube_pack.thumbnail_brief,
        );
        const [thumbnailUrl, contentUrl] = await Promise.all([
          ImageClient.generate(imagePrompts.thumbnail, '1536x1024'),
          ImageClient.generate(imagePrompts.content, '1024x1024'),
        ]);
        pack.youtube_pack.thumbnail_image_url = thumbnailUrl;
        pack.content_image_url = contentUrl;
        addStep(ctx, {
          agent: this.name,
          action: 'generate_images',
          input: { brand, topic, mock: ImageClient.isMock() },
          output: { thumbnail_image_url: thumbnailUrl, content_image_url: contentUrl },
          duration_ms: 0,
        });
      } catch (imgErr) {
        FileLogger.error('[ContentAgent] image generation failed (non-fatal)', imgErr);
      }

      RAGStore.ingest({
        title: `Content ${brand}: ${topic.slice(0, 80)}`,
        content: JSON.stringify(pack, null, 2),
        source: 'content_agent',
        tags: ['content', brand, topic.split(/\s+/)[0] ?? 'gold'],
      });

      const approvals = createContentPackApprovals({
        trace_id: ctx.trace_id,
        pack,
        user: ctx.user,
        agent: this.name,
      });
      await sendContentApprovalDm(pack, approvals).catch((err) =>
        FileLogger.error('[ContentAgent] admin DM failed', err),
      );

      const typefully = formatTypefullyBundle(pack);

      FileLogger.info('[ContentAgent] done', {
        brand,
        topic,
        pack_id: approvals.pack_id,
        approval_ids: {
          telegram: approvals.telegram.id,
          x: approvals.x.id,
          threads: approvals.threads.id,
        },
        shorts_script_len: pack.youtube_pack.shorts_script.length,
      });

      return {
        status: 'success',
        reply: formatContentReply(pack, approvals),
        next_actions: [
          `/approve_publish (TG: ${approvals.telegram.id.slice(0, 8)}…)`,
          `POST /approval/${approvals.telegram.id}/approve + publish:true`,
        ],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: {
          brand,
          topic,
          pack_id: approvals.pack_id,
          approval_id: approvals.telegram.id,
          approvals: {
            telegram: approvals.telegram.id,
            x: approvals.x.id,
            threads: approvals.threads.id,
          },
          typefully_copy_ready: true,
          typefully_export: typefully,
          content_pack: pack,
          research_articles: articles.length,
        },
      };
    } catch (err) {
      FileLogger.error('[ContentAgent] failed', err);
      return {
        status: 'error',
        reply: 'Content generation failed. Try again or check logs.',
        next_actions: [],
        agent: this.name,
        trace_id: ctx.trace_id,
      };
    }
  }
}
