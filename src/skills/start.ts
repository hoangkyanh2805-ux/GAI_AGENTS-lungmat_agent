import { Skill, SkillResult } from '../types';

export class StartSkill implements Skill {
  name = 'start';
  command = '/start';
  description = 'Khởi động bot — chào hỏi Linh Cẩu style';

  async execute(_payload: Record<string, unknown>): Promise<SkillResult> {
    const reply = `
👋 Chào ae! Em là **Linh Cẩu Trader** 🐆

Em ngồi đây canh chart XAUUSD cùng anh. Lệnh hay dùng:

\`/market_summary\` — Em phân tích vàng hiện tại (giá + 5 candles + sentiment)
\`/research [topic]\` — Em scrape news liên quan (Fed, DXY, inflation)
\`/help\` — Full menu lệnh

📅 Em tự chạy summary mỗi **7:00** và **22:30** (giờ VN) — anh sẽ nhận draft + nút ✅/❌ để duyệt.

⚠️ Lưu ý: Em không khuyến nghị buy/sell — em chỉ đưa data + góc nhìn. Quyết định là của anh.

Nào, ngó chart nhé ae 🔥
`.trim();

    return { reply, next_actions: [] };
  }
}
