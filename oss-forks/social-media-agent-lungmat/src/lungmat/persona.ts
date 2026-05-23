import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getPersonaPath } from "./config.js";

export type LungmatPersonaSections = {
  businessContext?: string;
  postContentRules?: string;
  postStructure?: string;
  tweetExamples?: string;
  compliance?: string;
};

const SECTION_MAP: Record<string, keyof LungmatPersonaSections> = {
  BUSINESS_CONTEXT: "businessContext",
  POST_CONTENT_RULES: "postContentRules",
  POST_STRUCTURE: "postStructure",
  TWEET_EXAMPLES: "tweetExamples",
  COMPLIANCE: "compliance",
};

/** Parse `oss-forks/prompts/alpha-persona.md` ## sections into prompt fields. */
export function loadPersonaSections(personaPath?: string): LungmatPersonaSections {
  const rel = personaPath || getPersonaPath();
  if (!rel) return {};

  const abs = resolve(process.cwd(), rel);
  let raw: string;
  try {
    raw = readFileSync(abs, "utf-8");
  } catch {
    console.warn(`[lungmat] persona file not found: ${abs}`);
    return {};
  }

  const sections: LungmatPersonaSections = {};
  const parts = raw.split(/^## /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    if (nl < 0) continue;
    const title = part.slice(0, nl).trim().replace(/\s*\(.*\)$/, "");
    const body = part.slice(nl + 1).trim();
    const key = SECTION_MAP[title];
    if (key) sections[key] = body;
  }
  return sections;
}

export function wrapBusinessContext(body: string): string {
  return `
Here is context about the content you promote:
<business-context>
${body}
</business-context>`;
}
