/** Shared helpers for the i18n scripts, so the two can't drift apart. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { parse } from "@formatjs/icu-messageformat-parser";

export const flatten = (obj, prefix = "") =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flatten(value, path));
    } else {
      acc[path] = value;
    }
    return acc;
  }, {});

export const unflatten = (flat) => {
  const out = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node = out;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) node[part] = value;
      else node = node[part] ??= {};
    });
  }
  return out;
};

export const hash = (value) =>
  createHash("sha256").update(value).digest("hex").slice(0, 16);

export const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/**
 * The set of ICU *argument names* in a message — the runtime values that must
 * survive translation.
 *
 * Two subtleties this has to get right:
 *
 *   - Plural branch bodies are also brace-wrapped (`one {Only # seat left}`),
 *     so an argument only counts when the identifier is followed by `}` or `,`.
 *     Matching bare `{Word` would flag every translated branch as a mismatch.
 *   - A *set*, not a list: plural categories differ by language (Arabic has
 *     six, English two), so the same argument legitimately appears a different
 *     number of times in each translation.
 */
export const placeholdersIn = (value) =>
  new Set(
    [...value.matchAll(/\{\s*([A-Za-z0-9_]+)\s*(?=[},])/g)].map((m) => m[1])
  );

export const samePlaceholders = (a, b) => {
  const left = placeholdersIn(a);
  const right = placeholdersIn(b);
  if (left.size !== right.size) return false;
  for (const name of left) if (!right.has(name)) return false;
  return true;
};

export const formatPlaceholders = (value) =>
  [...placeholdersIn(value)].sort().join(", ") || "none";

/**
 * Runs a message through the same ICU parser next-intl uses at runtime.
 *
 * Worth doing on top of the placeholder check because ICU has syntax a regex
 * will never see. The one that actually bit us: an apostrophe is ICU's escape
 * character, so a French plural reading `qu'#` silently starts a quoted literal
 * and swallows the rest of the message — the page then throws at render time.
 * Escape a literal apostrophe by doubling it (`''`), or reword around it.
 *
 * Returns null when the message parses, or the parser's message when it does not.
 */
export const icuError = (value) => {
  try {
    parse(value);
    return null;
  } catch (error) {
    return error.message.split("\n")[0];
  }
};

/** Reads the locale list out of src/i18n/config.ts so there is one source. */
export const localesFromConfig = (configPath) => {
  const src = readFileSync(configPath, "utf8");
  const match = src.match(/export const locales = \[([^\]]+)\]/);
  if (!match) throw new Error("Could not find `locales` in src/i18n/config.ts");
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};
