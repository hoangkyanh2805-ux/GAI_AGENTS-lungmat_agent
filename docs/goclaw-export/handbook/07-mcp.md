# 07 — Menu: MCP Servers

Menu **MCP Servers** quản lý kết nối với công cụ bên ngoài theo chuẩn Model Context Protocol.

---

## 7.1 MCP Là Gì

**MCP (Model Context Protocol)** = chuẩn mở do Anthropic phát triển, cho phép LLM kết nối với tool và resource bên ngoài theo cách chuẩn hóa.

**MCP Server** = service bên ngoài expose tools/resources theo chuẩn MCP → agent có thể gọi.

**Khác với Built-in Tools:**
- Built-in Tools: code tích hợp trong GoClaw core
- MCP Server: code chạy ngoài GoClaw (có thể là Python script, Node.js service, REST API)

**Dùng MCP khi:**
- Cần tích hợp với hệ thống bên thứ 3 (Google Drive, Notion, Jira, ...)
- Cần chạy logic phức tạp mà built-in tools không hỗ trợ
- Muốn viết tool riêng mà không cần sửa core GoClaw

---

## 7.2 Transport Types

| Transport | Dùng khi | Cách hoạt động |
|-----------|---------|---------------|
| **stdio** | MCP server là local script trên VPS | GoClaw spawn process, giao tiếp qua stdin/stdout JSON-RPC |
| **SSE** | MCP server đang chạy sẵn (remote hoặc local), push events | GoClaw connect tới URL, server stream events qua SSE |
| **HTTP** | REST API tuân thủ MCP spec | GoClaw gọi HTTP endpoints theo spec MCP |

**Khuyến nghị chọn transport:**
- Local Python/Node script → dùng **stdio** (đơn giản nhất)
- Service đã deploy (FastAPI, Express) → dùng **SSE** hoặc **HTTP**
- Third-party MCP server có URL → dùng **SSE**

---

## 7.3 Tạo MCP Server — Stdio

Sidebar → **MCP Servers** → **+ Tạo** → chọn **stdio**.

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Name | Tên server | `my-python-tools` |
| Command | Lệnh chạy script | `python` |
| Args | Tham số lệnh | `["/opt/mcp/server.py", "--mode", "prod"]` |
| Env | Biến môi trường | `{"API_KEY": "secret", "DEBUG": "0"}` |
| Working dir | Thư mục làm việc | `/opt/mcp` |

**Ví dụ stdio MCP server Python:**
```python
# /opt/mcp/server.py
import json, sys

def handle_request(req):
    method = req.get("method")
    if method == "tools/list":
        return {"tools": [
            {"name": "get_weather", "description": "Lấy thời tiết hiện tại", 
             "inputSchema": {"type": "object", "properties": {"city": {"type": "string"}}}}
        ]}
    elif method == "tools/call":
        tool_name = req["params"]["name"]
        args = req["params"]["arguments"]
        if tool_name == "get_weather":
            return {"content": [{"type": "text", "text": f"Hà Nội: 32°C, nắng"}]}

for line in sys.stdin:
    req = json.loads(line)
    result = handle_request(req)
    print(json.dumps(result), flush=True)
```

---

## 7.4 Tạo MCP Server — SSE

Sidebar → **MCP Servers** → **+ Tạo** → chọn **SSE**.

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Name | Tên server | `notion-mcp` |
| URL | Endpoint SSE | `http://localhost:3001/sse` |
| Headers | Auth headers | `{"Authorization": "Bearer token123"}` |
| Reconnect delay | Đợi bao lâu trước khi reconnect nếu mất kết nối | 5000 (ms) |

**Lưu ý:**
- URL phải accessible từ GoClaw container (trên cùng VPS: `localhost`, `172.17.x.x`, etc.)
- Nếu server remote: đảm bảo firewall cho phép
- SSE server phải tự quản lý reconnect logic

---

## 7.5 Tạo MCP Server — HTTP

Sidebar → **MCP Servers** → **+ Tạo** → chọn **HTTP**.

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Name | Tên server | `custom-api` |
| Base URL | Base URL của service | `https://api.myservice.com/mcp` |
| Auth type | Bearer / API Key / Basic | Bearer |
| Token / Key | Credential | `sk-...` |
| Timeout | Request timeout (ms) | 30000 |

**Endpoint GoClaw gọi:**
- `GET {base_url}/tools` → list tools
- `POST {base_url}/tools/{name}` → gọi tool

---

## 7.6 Grant Permissions

Sau khi tạo MCP server → phải **grant** cho agent cụ thể mới dùng được.

**Cách grant:**
1. MCP Servers → chọn server → tab **Quyền**
2. Click **+ Grant cho Agent** → chọn agent
3. Chọn permission level

Hoặc từ phía agent:
1. Agents → [agent] → tab MCP → **+ Grant MCP Server** → chọn server

**Permission levels:**

| Level | Agent có thể |
|-------|-------------|
| `read-only` | Gọi tool `list_*`, `get_*`, `search_*` |
| `read-write` | Gọi tất cả tool kể cả `create_*`, `update_*`, `delete_*` |
| `admin` | Tất cả + tool cấu hình server |

**Per-tool grant (nâng cao):**
- Thay vì grant cả server → chỉ grant tool cụ thể
- VD: grant `get_notion_page` nhưng không grant `delete_notion_page`
- Cài tại: Grant → **Tùy chỉnh tools** → bật/tắt từng tool

---

## 7.7 User Credentials

Một số MCP server cần credential riêng theo từng user (VD: Google Drive của user A khác user B).

**Flow:**
1. Admin cài MCP server (chỉ server config, không có user credential)
2. User lần đầu dùng tool → GoClaw yêu cầu user nhập credential
3. User nhập qua Web Chat hoặc Telegram DM (secure form)
4. Credential encrypted, lưu per-user per-server
5. Admin không thể xem credential của user

**Ví dụ Google Drive MCP:**
```
User: "Tìm file báo cáo Q1 trong Drive của tôi"
Agent: "Để truy cập Google Drive, tôi cần bạn authorize. [Link: Authorize Google Drive]"
User: [click link, đăng nhập Google, cấp quyền]
Agent: [nhận OAuth token, lưu encrypted]
Agent: "Tôi tìm thấy 3 file: [list]"
```

---

## 7.8 MCP Tool Discovery

Khi agent bắt đầu session:
1. GoClaw gọi `tools/list` trên tất cả MCP server được grant
2. Nhận danh sách tools với name, description, inputSchema
3. Đưa tools vào context của agent (phần tool definitions)
4. Agent có thể gọi tool bất kỳ trong danh sách

**Refresh tool list:**
- Không cần restart GoClaw
- MCP Servers → [server] → **Refresh tools** → cập nhật danh sách ngay
- Hoặc tự động refresh khi bắt đầu session mới

**Hiển thị trong agent context:**
```
Available tools from notion-mcp:
- get_page(page_id: string): Get Notion page content
- search_pages(query: string): Search pages in workspace
- create_page(title: string, content: string): Create new page
```

---

## 7.9 Debug MCP

**Log request/response:**
MCP Servers → [server] → tab **Logs**:
- Xem tất cả tool calls với timestamp
- Request params và response của mỗi call
- Thời gian xử lý (latency)

**Test tool trực tiếp:**
MCP Servers → [server] → tab **Test**:
1. Chọn tool từ dropdown
2. Điền params dưới dạng JSON
3. Click **Chạy** → xem kết quả

**Xem error:**
- Error khi MCP server crash: `Connection refused` hoặc `Process exited with code N`
- Error khi tool fail: message từ server trong response
- Network error (SSE/HTTP): timeout, SSL, firewall

**Restart server (stdio):**
MCP Servers → [server] → **Restart** → GoClaw kill process cũ và spawn lại.

---

## 7.10 Security

**Nguyên tắc bảo mật MCP:**

1. **Minimize exposure**: MCP server stdio nên chạy trong network VPS, không expose public nếu không cần.

2. **Least privilege**: stdio server chạy với OS user ít quyền nhất:
   ```yaml
   # docker-compose.yml
   services:
     mcp-server:
       user: "nobody:nogroup"
       read_only: true
   ```

3. **Tool name whitelist**: trong grant permission, chỉ allow tool thực sự cần.

4. **Tránh privilege escalation**: không để MCP tool có thể tạo MCP server mới hoặc thay đổi agent config.

5. **Credential rotation**: với SSE/HTTP servers dùng token → rotate định kỳ 90 ngày.

6. **Audit log**: tất cả MCP tool calls đều logged trong Dashboard → dùng để detect anomaly.
