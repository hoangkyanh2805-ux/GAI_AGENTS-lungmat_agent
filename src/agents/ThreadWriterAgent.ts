import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { AnthropicClient } from '../integrations/AnthropicClient';
import { RAGStore } from '../rag/RAGStore';
import { ApprovalStore } from '../approval/ApprovalStore';
import { addStep, timed } from '../trace/ExecutionTrace';
import { FileLogger } from '../memory/FileLogger';

export class ThreadWriterAgent implements SubAgent {
  readonly name = 'ThreadWriterAgent';
  readonly role: AgentRole = 'thread_writer';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    const rawTopic = (message.payload.topic as string | undefined) ?? message.content.replace('/write_thread', '').trim();
    const topic = rawTopic || 'AI and markets';

    try {
      // 1. Gather context from RAG
      const results = RAGStore.search(topic, 3);
      const context = results
        .map((r) => r.document.content)
        .join('\n\n')
        .slice(0, 3000);
      addStep(ctx, {
        agent: this.name,
        action: 'rag_search',
        input: { topic },
        output: { results: results.length, context_chars: context.length },
        duration_ms: 0,
      });

      // 2. Write thread via LLM
      const prompt = context
        ? `Topic: ${topic}\n\nContext:\n${context}\n\nNow write the Twitter thread.`
        : `Write a Twitter thread about: ${topic}`;

      const { result: threadText, duration_ms: llmMs } = await timed(() =>
        AnthropicClient.chat(
          [{ role: 'user', content: prompt }],
          {
            system:
              'You are a social media expert. Write a 5-tweet Twitter thread. ' +
              'Format each tweet on its own line starting with a number and slash (1/, 2/, etc.). ' +
              'Keep each tweet under 280 characters. Include hashtags in the last tweet.',
          },
        ),
      );
      addStep(ctx, {
        agent: this.name,
        action: 'write_thread',
        input: { topic, context_length: context.length },
        output: { thread_length: threadText.length },
        duration_ms: llmMs,
      });

      // 3. Create approval request
      const approval = ApprovalStore.create({
        trace_id: ctx.trace_id,
        type: 'publish_telegram',
        content: threadText,
        agent: this.name,
        user: ctx.user,
      });

      FileLogger.info('[ThreadWriterAgent] done', { topic, approval_id: approval.id });
      return {
        status: 'success',
        reply: `*Thread Draft — ${topic}*\n\n${threadText}\n\n⏳ Pending approval: \`${approval.id}\``,
        next_actions: [`POST /approval/${approval.id}/approve`, '/publish_telegram'],
        agent: this.name,
        trace_id: ctx.trace_id,
        meta: { approval_id: approval.id, topic },
      };
    } catch (err) {
      FileLogger.error('[ThreadWriterAgent] failed', err);
      return { status: 'error', reply: 'Thread writing failed.', next_actions: [], agent: this.name, trace_id: ctx.trace_id };
    }
  }
}
