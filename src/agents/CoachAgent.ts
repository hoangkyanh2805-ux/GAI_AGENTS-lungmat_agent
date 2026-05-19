import { SubAgent, AgentMessage, AgentResponse, AgentRole, ExecutionContext } from '../types';
import { AnthropicClient } from '../integrations/AnthropicClient';
import { isAdminChat } from '../auth/isAdminChat';
import { withLungCoachPersona } from '../llm/personaLung';
import { addStep, timed } from '../trace/ExecutionTrace';

const ADMIN_DENIED =
  '⚠️ `/coach` chỉ dùng trong **admin DM** (chat_id = ADMIN_TELEGRAM_CHAT_ID). ' +
  'Set biến trong `.env`, nhắn bot `/start` trong chat riêng, rồi gọi lại.';

export class CoachAgent implements SubAgent {
  readonly name = 'CoachAgent';
  readonly role: AgentRole = 'coach';

  async process(message: AgentMessage, ctx: ExecutionContext): Promise<AgentResponse> {
    if (!isAdminChat(message)) {
      addStep(ctx, {
        agent: this.name,
        action: 'admin_denied',
        input: { chat_id: message.payload.chat_id },
        output: {},
        duration_ms: 0,
      });
      return {
        status: 'error',
        reply: ADMIN_DENIED,
        next_actions: ['/debug_env'],
        agent: this.name,
        trace_id: ctx.trace_id,
      };
    }

    const question =
      (typeof message.payload.text === 'string' && message.payload.text.trim()) ||
      (typeof message.payload.topic === 'string' && message.payload.topic.trim()) ||
      message.content.replace(/^\/coach\s*/i, '').trim() ||
      'Anh cần em hỗ trợ gì về Media OS / verify live?';

    const system = withLungCoachPersona();
    const { result: reply, duration_ms } = await timed(() =>
      AnthropicClient.chat([{ role: 'user', content: question }], {
        system,
        maxTokens: 1200,
      }),
    );

    addStep(ctx, {
      agent: this.name,
      action: 'coach_llm',
      input: { question_len: question.length },
      output: { reply_len: reply.length },
      duration_ms,
    });

    return {
      status: 'success',
      reply,
      next_actions: ['/debug_env', '/approval_list', '/content'],
      agent: this.name,
      trace_id: ctx.trace_id,
    };
  }
}
