# SOP SalesMartly Hybrid Integration

## Mục tiêu

Kết hợp `SalesMartly` làm front-line sales automation với `linhcau79_ok` / `lungmat-agent` làm expert trading/content.
Mục tiêu là:
- Giữ SalesMartly tiếp khách 1:1
- Chuyển các yêu cầu trading/content chuyên sâu sang Linh Cẩu
- Human handler xử lý lead nóng, approval, follow-up
- Duy trì kiểm soát nội dung publish và không để Linh Cẩu tự chat free-text

## Tổng quan luồng

1. Khách hàng chat với SalesMartly.
2. SalesMartly classify intent.
3. Nếu intent là trading/content → gửi webhook tới `lungmat-agent`.
4. Nếu intent là hot lead hoặc cần support sâu → notify human handler.
5. `lungmat-agent` xử lý request bằng các agent nội bộ.
6. Nếu cần publish nội dung → đi qua `ApprovalStore` + human review.
7. Tất cả dữ liệu lead/context lưu vào memory/CRM.

## Thành phần chính

### SalesMartly
- Front-end customer chat
- Lead qualification
- Capture thông tin khách
- Route intent
- Notify human handler cho hot lead

### lungmat-agent
- `SalesMartlyIntegration` (webhook receiver)
- `ContentAgent` / `MarketSummaryAgent` / `SupportAgent`
- `ApprovalStore` / `TelegramPublisherAgent`
- `MemoryAgent` để lưu context

### Human handler
- Duyệt hot lead
- Duyệt nội dung publish
- Hỗ trợ follow-up, xử lý compliance

## Luồng chi tiết

### A. SalesMartly tiếp nhận khách

SalesMartly flow cần:
- Thu thập thông tin cơ bản: `name`, `phone`, `interest`, `source`, `notes`
- Phân loại intent:
  - `TRADE_INSIGHT`
  - `CONTENT_REQUEST`
  - `HOT_LEAD`
  - `GENERAL_SUPPORT`
- Tạo `conversation_id`
- Nếu cần, gửi webhook đến repo

### B. SalesMartly webhook gửi đến repo

Webhook JSON mẫu từ SalesMartly:

```json
{
  "secret": "xxx",
  "conversation_id": "abc123",
  "customer": {
    "name": "Nguyen Van A",
    "phone": "+84901234567"
  },
  "intent": "TRADE_INSIGHT",
  "category": "trading",
  "topic": "XAUUSD market outlook",
  "notes": "Customer wants daily gold insight",
  "metadata": {
    "source": "facebook_ads",
    "utm_campaign": "may22"
  }
}
```

### C. Route request nội bộ

1. Parse payload
2. Verify `SALESMARTLY_WEBHOOK_SECRET`
3. Map intent:
   - `TRADE_INSIGHT` / `CONTENT_REQUEST` → `ContentAgent` hoặc `MarketSummaryAgent`
   - `GENERAL_SUPPORT` → `SupportAgent`
   - `HOT_LEAD` → human handler notification
4. Lưu lead context vào `MemoryAgent`
5. Nếu route đến Linh Cẩu, tạo internal synthetic command

### D. Xử lý bằng Linh Cẩu

Đối với trading/content:
- `TRADE_INSIGHT` → `MarketSummaryAgent` hoặc `ContentAgent`
- `CONTENT_REQUEST` → `ContentAgent`

Ví dụ internal command:
- `/content alpha XAUUSD daily outlook`
- `/market_summary XAUUSD`

### E. Human handler

- Nhận notification khi SalesMartly đánh dấu `HOT_LEAD`
- Nhận notification khi nội dung cần review/approve
- Duyệt qua `ApprovalStore`
- Nếu ok, gọi `TelegramPublisherAgent` publish

## Implementation checklist

### 1. Tạo module integration
- [ ] `src/integrations/SalesMartlyClient.ts`
- [ ] `src/routes/salesmartly.ts`
- [ ] `src/types/index.ts` thêm `SalesMartlyPayload`
- [ ] `src/config/env.ts` thêm biến `SALESMARTLY_ENABLED`, `SALESMARTLY_WEBHOOK_SECRET`

### 2. Thêm route webhook
- [ ] Đăng ký `/salesmartly/webhook` trong `src/index.ts`
- [ ] Route trả 200 với JSON `{ status: 'ok' }`
- [ ] Validate secret signature / secret field

### 3. Map intent và dispatch
- [ ] Tạo helper `SalesMartlyIntegration.routePayload()`
- [ ] Map intent với rules rõ ràng
- [ ] Gọi internal `SupervisorAgent.process()` hoặc agent tương ứng

### 4. Lưu context
- [ ] Tạo `SalesMartlyContext` record trong `MemoryAgent`
- [ ] Ghi: `conversation_id`, `customer`, `intent`, `notes`, `source`, `timestamp`
- [ ] Khi `ContentAgent` / `MarketSummaryAgent` chạy, prepend context if available

### 5. Human notification
- [ ] Nếu payload.intent === `HOT_LEAD`, gửi message đến `ADMIN_TELEGRAM_CHAT_ID`
- [ ] Tạo summary lead trong admin DM
- [ ] Optional: tạo task log file / Supabase event

### 6. `ApprovalStore` vẫn là gate
- [ ] `ContentAgent` tạo approvals cho Telegram/X/Threads
- [ ] `ApprovalStore` vẫn xử lý `approve` / `reject`
- [ ] `TelegramPublisherAgent` chỉ publish khi approved

### 7. Định nghĩa guard rails Linh Cẩu
- [ ] Chỉ process `/command` trong `TelegramReceiver`
- [ ] Nếu nhận free-text 1:1, trả thong bao `Use /help`
- [ ] Nếu payload từ SalesMartly chứa yêu cầu non-command, convert sang synthetic command

### 8. Docs update
- [ ] Cập nhật `docs/architecture.md` với luồng SalesMartly hybrid
- [ ] Cập nhật `docs/SOP_SalesMartly_Hybrid.md`

## Pseudo-code cho SalesMartlyIntegration

```ts
// src/integrations/SalesMartlyClient.ts
import axios from 'axios';
import { ENV } from '../config/env';
import { SupervisorAgent } from '../agents/SupervisorAgent';
import { MemoryAgent } from '../agents/MemoryAgent';
import { ContentAgent } from '../agents/ContentAgent';
import { MarketSummaryAgent } from '../agents/MarketSummaryAgent';
import { SupportAgent } from '../agents/SupportAgent';
import { FileLogger } from '../memory/FileLogger';

export interface SalesMartlyPayload {
  secret: string;
  conversation_id: string;
  intent: 'TRADE_INSIGHT' | 'CONTENT_REQUEST' | 'HOT_LEAD' | 'GENERAL_SUPPORT';
  category?: string;
  topic?: string;
  notes?: string;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
  };
  metadata?: Record<string, unknown>;
}

export class SalesMartlyClient {
  static isEnabled(): boolean {
    return ENV.SALESMARTLY_ENABLED === '1';
  }

  static validate(payload: SalesMartlyPayload): boolean {
    return payload.secret === ENV.SALESMARTLY_WEBHOOK_SECRET;
  }

  static async routePayload(payload: SalesMartlyPayload): Promise<void> {
    if (!this.validate(payload)) {
      throw new Error('Invalid SalesMartly secret');
    }

    const context = {
      customer: payload.customer,
      conversation_id: payload.conversation_id,
      source: 'salesmartly',
      intent: payload.intent,
      notes: payload.notes,
      metadata: payload.metadata,
    };

    MemoryAgent.store({
      type: 'salesmartly_lead',
      key: payload.conversation_id,
      value: context,
    });

    switch (payload.intent) {
      case 'TRADE_INSIGHT':
      case 'CONTENT_REQUEST':
        return this.callLinhCau(payload, context);
      case 'GENERAL_SUPPORT':
        return SupportAgent.processInternal({
          command: '/support',
          payload: { topic: payload.topic ?? payload.notes },
          context,
        });
      case 'HOT_LEAD':
        return this.notifyHumanHandler(context);
      default:
        return this.notifyHumanHandler(context);
    }
  }

  private static async callLinhCau(payload: SalesMartlyPayload, context: any) {
    const command = payload.intent === 'TRADE_INSIGHT'
      ? `/market_summary ${payload.topic ?? 'XAUUSD'}'
      : `/content alpha ${payload.topic ?? 'XAUUSD insight'}`;

    const message = {
      id: crypto.randomUUID(),
      content: command,
      command: command.split(' ')[0],
      payload: { ...payload, context },
      user: `salesmartly:${payload.conversation_id}`,
      source: 'salesmartly',
      timestamp: new Date().toISOString(),
    };

    return SupervisorAgent.process(message.command, message.payload, {
      user: message.user,
      source: message.source,
    });
  }

  private static async notifyHumanHandler(context: any) {
    const text = `HOT LEAD from SalesMartly:\n` +
      `Customer: ${context.customer.name ?? 'unknown'} / ${context.customer.phone ?? 'unknown'}\n` +
      `Topic: ${context.notes ?? 'no topic'}\n` +
      `Conversation: ${context.conversation_id}`;

    await TelegramClient.sendMessage(ENV.ADMIN_TELEGRAM_CHAT_ID, text);
  }
}
```

## Kịch bản ví dụ

### 1. Khách hỏi review thị trường vàng
- SalesMartly nhận form
- intent = `TRADE_INSIGHT`
- webhook đến repo
- `SalesMartlyIntegration` gọi `ContentAgent` hoặc `MarketSummaryAgent`
- repo trả kết quả expert
- nếu cần publish, nội dung đi qua approval

### 2. Khách có dấu hiệu mua nóng
- SalesMartly đánh dấu `HOT_LEAD`
- human handler nhận tin ngay
- human handler follow-up qua Telegram/CRM

### 3. Khách hỏi general support
- SalesMartly xử lý ngay bằng `SupportAgent`
- nếu không xử lý được, forward human handler

## Lời khuyên

- Bắt đầu với webhook đơn giản và `TRADE_INSIGHT`/`CONTENT_REQUEST` trước.
- Không để Linh Cẩu xử lý free-text sales direct.
- Xây `ApprovalStore` như gate publish content.
- Lưu context SalesMartly vào memory để trả lại conversation history.

---

Phiên bản SOP này là đủ để triển khai giai đoạn hybrid giữa SalesMartly, Linh Cẩu và human handler cho repo hiện tại.