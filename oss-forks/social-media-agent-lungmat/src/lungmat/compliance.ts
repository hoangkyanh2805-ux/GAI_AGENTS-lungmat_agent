/** Alpha pack compliance — mirror services/alpha-factory/validator.py */

export type AlphaPack = Record<string, unknown>;

const BANNED: RegExp[] = [
  /vào long/i,
  /vào short/i,
  /\bentry\b/i,
  /\bSL\b/,
  /\bTP\b/,
  /chắc ăn/i,
  /guaranteed/i,
];
const URL_IN_TWEET = /https?:\/\//i;

export function validatePack(pack: AlphaPack): AlphaPack {
  const failed: number[] = [];
  const brief = String(pack.telegram_brief ?? "");
  let tweets = pack.x_thread;
  if (!Array.isArray(tweets)) {
    tweets = tweets ? [String(tweets)] : [];
  }
  const threads = String(pack.threads_post ?? "");
  const texts = [brief, ...tweets.map(String), threads];

  if (BANNED.some((r) => texts.some((t) => r.test(t)))) {
    failed.push(1);
  }
  for (const t of tweets) {
    if (String(t).length > 280) failed.push(4);
    if (URL_IN_TWEET.test(String(t))) failed.push(4);
  }
  if (threads.length > 500) failed.push(4);

  const unique = [...new Set(failed)].sort((a, b) => a - b);
  pack.compliance = {
    status: unique.length === 0 ? "PASS" : "FAIL",
    failed_rules: unique,
  };
  return pack;
}
