# Lửng Mật — persona pack

Distill từ export Telegram `botlungmat/result.json` (local, gitignored).

| File | Mục đích |
|------|----------|
| [SOUL.md](./SOUL.md) | Identity, voice, modes, hard rules |
| [WORKSTYLE.md](./WORKSTYLE.md) | Reply, im lặng, handoff, anti-patterns |
| [EXAMPLES.md](./EXAMPLES.md) | 22 ví dụ vàng (auto) |
| [distill-stats.json](./distill-stats.json) | Số liệu distill |

Regenerate examples:

```bash
npm run distill:lung
```

| Runtime | Path |
|---------|------|
| Linh Cẩu 🐆 | `src/llm/persona.ts` + few-shot |
| Lửng coach 🦡 | `src/llm/personaLung.ts` → `CoachAgent` `/coach` (admin DM) |
| Cursor rule | `.cursor/rules/lung-mat.mdc` |
