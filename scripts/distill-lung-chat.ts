/**
 * Distill Telegram export (botlungmat/result.json) → persona artifacts.
 * Run: npx tsx scripts/distill-lung-chat.ts
 * Requires: botlungmat/result.json (not committed; see .gitignore)
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'botlungmat', 'result.json');
const OUT_DIR = path.join(ROOT, 'docs', 'lung-mat');

const BOT_NAME = 'Lửng Mật';
const MIN_EXAMPLE_LEN = 80;
const MAX_EXAMPLE_LEN = 700;
const MAX_EXAMPLES = 22;

type TgMessage = {
  type: string;
  from?: string;
  date?: string;
  text?: string | Array<string | { text?: string }>;
  reply_to_message_id?: number;
};

function textOf(m: TgMessage): string {
  const t = m.text;
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) {
    return t.map((x) => (typeof x === 'string' ? x : x.text ?? '')).join('');
  }
  return '';
}

function isCodeDump(s: string): boolean {
  return (
    s.length > 900 ||
    /^import |<!DOCTYPE|<html|export async function|const supabase = createClient/.test(s)
  );
}

function scoreExample(s: string): number {
  let score = 0;
  if (/🦡/.test(s)) score += 2;
  if (/⚠️/.test(s)) score += 1;
  if (/^\d+\.\s/m.test(s)) score += 2;
  if (/^(Dạ|Á |Chốt|Quá ngon|Trả lời)/.test(s.trim())) score += 2;
  if (/xauusd|liquidity|FVG|setup|chart|vàng|gold/i.test(s)) score += 3;
  if (/Tôi rất vui|xin lỗi vì sự bất tiện/i.test(s)) score -= 10;
  if (/taip\.io|cọc|nộp bài|KP3/i.test(s)) score -= 1;
  if (s.length >= MIN_EXAMPLE_LEN && s.length <= MAX_EXAMPLE_LEN) score += 3;
  return score;
}

function main(): void {
  if (!fs.existsSync(INPUT)) {
    console.error(`Missing ${INPUT}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT, 'utf8');
  const data = JSON.parse(raw) as { name?: string; messages: TgMessage[] };
  const lung = data.messages.filter(
    (m) => m.type === 'message' && m.from === BOT_NAME,
  );

  const texts = lung.map(textOf).filter((t) => t.trim().length > 0);
  const lens = texts.map((t) => t.length).sort((a, b) => a - b);
  const avg = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);

  const withReply = lung.filter((m) => m.reply_to_message_id).length;
  const withBadger = texts.filter((t) => /🦡/.test(t)).length;
  const withFire = texts.filter((t) => /🔥/.test(t)).length;

  const starters: Record<string, number> = {};
  for (const t of texts) {
    const head = t.trim().slice(0, 24).replace(/\s+/g, ' ');
    starters[head] = (starters[head] || 0) + 1;
  }
  const topStarters = Object.entries(starters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const candidates = lung
    .map((m) => ({ m, t: textOf(m), score: 0 }))
    .filter(({ t }) => !isCodeDump(t) && t.length >= MIN_EXAMPLE_LEN)
    .map(({ m, t }) => ({ m, t, score: scoreExample(t) }))
    .sort((a, b) => b.score - a.score);

  const picked: typeof candidates = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    const key = c.t.slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(c);
    if (picked.length >= MAX_EXAMPLES) break;
  }

  const stats = {
    chatName: data.name,
    botName: BOT_NAME,
    messageCount: lung.length,
    lengthAvg: Math.round(avg),
    lengthMedian: lens[Math.floor(lens.length / 2)] ?? 0,
    lengthP90: lens[Math.floor(lens.length * 0.9)] ?? 0,
    replyRate: withReply / (lung.length || 1),
    withBadger,
    withFire,
    topStarters,
    exampleCount: picked.length,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, 'distill-stats.json'),
    JSON.stringify(stats, null, 2),
    'utf8',
  );

  const examplesMd = [
    '# Lửng Mật — ví dụ vàng (auto-distill)',
    '',
    `> Generated from \`botlungmat/result.json\`. ${picked.length} samples, length ${MIN_EXAMPLE_LEN}–${MAX_EXAMPLE_LEN} chars (code dumps excluded).`,
    `> Re-run: \`npx tsx scripts/distill-lung-chat.ts\``,
    '',
    '---',
    '',
  ];

  picked.forEach((p, i) => {
    examplesMd.push(
      `## ${i + 1}. ${p.m.date ?? 'unknown'} (score ${p.score}, ${p.t.length} chars)`,
      '',
      '```text',
      p.t.trim(),
      '```',
      '',
    );
  });

  fs.writeFileSync(path.join(OUT_DIR, 'EXAMPLES.md'), examplesMd.join('\n'), 'utf8');

  console.log(JSON.stringify(stats, null, 2));
  console.log(`Wrote ${OUT_DIR}/distill-stats.json and EXAMPLES.md`);
}

main();
