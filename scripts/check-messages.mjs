/**
 * Validates every `messages/<locale>.json` against `messages/en.json`.
 *
 *   npm run i18n:check
 *   npm run i18n:check -- --write-hashes
 *
 * Checks four things, in order of how badly they break the page:
 *   1. Every message parses as ICU — a stray apostrophe before `#` or `{`
 *      starts an escape and throws at render time.
 *   2. ICU placeholders match — a dropped `{count}` throws too.
 *   3. No missing keys — next-intl renders the raw key path instead.
 *   4. No stale keys left behind after English removed them.
 *
 * `--write-hashes` refreshes `messages/.hashes.json` to mark every current
 * translation as up to date with the English it sits beside. Use it after
 * hand-writing or hand-editing a locale file, so `i18n:translate` doesn't
 * re-translate strings that are already correct.
 */
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  flatten,
  hash,
  readJson,
  samePlaceholders,
  formatPlaceholders,
  icuError,
  localesFromConfig,
} from "./lib/messages.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(here, "..", "messages");
const configPath = resolve(here, "..", "src", "i18n", "config.ts");

const writeHashes = process.argv.includes("--write-hashes");

const locales = localesFromConfig(configPath);
const source = flatten(readJson(resolve(messagesDir, "en.json")));
const sourceKeys = Object.keys(source);

console.log(`\nen: ${sourceKeys.length} strings`);

let failed = false;
const hashes = {};

for (const locale of locales.filter((l) => l !== "en")) {
  const path = resolve(messagesDir, `${locale}.json`);

  if (!existsSync(path)) {
    console.error(
      `\n${locale}: messages/${locale}.json is missing.\n` +
        `  Run: npm run i18n:translate -- ${locale}`
    );
    failed = true;
    continue;
  }

  const target = flatten(readJson(path));
  const problems = [];
  const localeHashes = {};

  for (const key of sourceKeys) {
    const value = target[key];
    if (typeof value !== "string") {
      problems.push(`missing       ${key}`);
      continue;
    }
    const icu = icuError(value);
    if (icu) {
      problems.push(`icu           ${key}
                ${icu}`);
      continue;
    }
    if (!samePlaceholders(source[key], value)) {
      problems.push(
        `placeholder   ${key}\n` +
          `                en → ${formatPlaceholders(source[key])}\n` +
          `                ${locale} → ${formatPlaceholders(value)}`
      );
      continue;
    }
    localeHashes[key] = hash(source[key]);
  }

  for (const key of Object.keys(target)) {
    if (!(key in source)) problems.push(`stale         ${key}`);
  }

  if (problems.length) {
    console.error(`\n${locale}: ${problems.length} problem(s)`);
    for (const problem of problems.slice(0, 20)) console.error(`  ${problem}`);
    if (problems.length > 20) {
      console.error(`  … and ${problems.length - 20} more`);
    }
    failed = true;
  } else {
    console.log(`${locale}: ok (${sourceKeys.length} strings)`);
    hashes[locale] = localeHashes;
  }
}

if (writeHashes && !failed) {
  writeFileSync(
    resolve(messagesDir, ".hashes.json"),
    JSON.stringify(hashes, null, 2) + "\n"
  );
  console.log("\nwrote messages/.hashes.json");
}

if (failed) {
  console.error("");
  process.exit(1);
}

console.log("");
