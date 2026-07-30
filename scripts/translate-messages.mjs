/**
 * Generates `messages/<locale>.json` from `messages/en.json` using Claude.
 *
 *   npm run i18n:translate -- fr es ar
 *   npm run i18n:translate            # every locale in src/i18n/config.ts
 *
 * English is the source of truth and is never written to. For every other
 * locale the script is incremental: `messages/.hashes.json` records the hash of
 * the English string each translation was made from, so a re-run only touches
 * keys whose English changed, plus keys the target is missing. Everything else
 * — including wording you fixed by hand — is copied through untouched.
 *
 * Requires an Anthropic credential: ANTHROPIC_API_KEY, or an `ant auth login`
 * profile, which the SDK picks up from a bare `new Anthropic()`.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  flatten,
  unflatten,
  hash,
  readJson,
  samePlaceholders,
  formatPlaceholders,
  localesFromConfig,
} from "./lib/messages.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const messagesDir = resolve(here, "..", "messages");
const sourcePath = resolve(messagesDir, "en.json");
const hashPath = resolve(messagesDir, ".hashes.json");
const configPath = resolve(here, "..", "src", "i18n", "config.ts");

const BATCH_SIZE = 40;
const MODEL = "claude-opus-5";

/** Never translated — brand names, codes, and anything inside {…}. */
const GLOSSARY = [
  "United Fly",
  "United Fly Airlines",
  "MileClub",
  "IATA",
  "PCI DSS",
  "Cash App",
  "Visa",
  "Mastercard",
  "Verve",
  "Bitcoin",
  "Ethereum",
  "WhatsApp",
];

// ---------------------------------------------------------------- locales ---

const configured = localesFromConfig(configPath);
const requested = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = (requested.length ? requested : configured).filter(
  (l) => l !== "en"
);

const unknown = targets.filter((l) => !configured.includes(l));
if (unknown.length) {
  console.error(
    `\n  ${unknown.join(", ")} not listed in src/i18n/config.ts.\n` +
      `  Add the code (and a display name) there first, so the switcher can offer it.\n`
  );
  process.exit(1);
}

if (!targets.length) {
  console.log("Nothing to translate — English is the source.");
  process.exit(0);
}

// ------------------------------------------------------------ translating ---

/**
 * Constructed on first use, not at startup: an up-to-date run makes no API
 * calls, and shouldn't demand a credential just to report that.
 */
let client;
const getClient = () => (client ??= new Anthropic());

const TranslationBatch = z.object({
  translations: z
    .array(
      z.object({
        key: z.string().describe("The key exactly as given."),
        value: z.string().describe("The translated string."),
      })
    )
    .describe("One entry per key in the batch, in the same order."),
});

const systemPrompt = `You translate user-interface strings for United Fly Airlines, a flight booking website.

Rules:
- Translate naturally for a traveller booking a flight, not literally. Match the register of airline websites in the target language.
- Keep the tone and length close to the English. These are buttons, labels, headings and short paragraphs in a live UI — an over-long translation breaks the layout.
- NEVER translate anything inside curly braces. \`{count}\`, \`{amount}\`, \`{flight}\` and similar are runtime values and must appear in the output exactly as in the input.
- Preserve ICU message syntax exactly, including \`{count, plural, one {...} other {...}}\`. Translate only the human-readable text inside the branches, and use the plural categories that are correct for the target language.
- Keep these untranslated: ${GLOSSARY.join(", ")}. Also leave airport codes (LOS, LHR, JFK), currency symbols, numbers, and punctuation marks such as · and → as they are.
- Preserve leading/trailing spaces, capitalisation style, and trailing punctuation.
- The key name is context: a key under "errors" is a validation message, one under "steps" is a progress-bar label, one ending in "Placeholder" is input placeholder text.

Return one entry per key you were given, with the key unchanged.`;

async function translateBatch(locale, entries) {
  const payload = entries
    .map(([key, value]) => `${key}\n${JSON.stringify(value)}`)
    .join("\n\n");

  const response = await getClient().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    output_config: {
      effort: "medium",
      format: zodOutputFormat(TranslationBatch, "translations"),
    },
    messages: [
      {
        role: "user",
        content: `Translate these ${entries.length} interface strings from English into ${locale}.\n\nEach block is a key line followed by the JSON-encoded English string:\n\n${payload}`,
      },
    ],
  });

  // A safety classifier can decline; surface it rather than writing a hole.
  if (response.stop_reason === "refusal") {
    throw new Error(
      `Claude declined this batch (${response.stop_details?.category ?? "no category"}). Re-run to retry.`
    );
  }

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Model returned no parseable translations.");

  return new Map(parsed.translations.map((t) => [t.key, t.value]));
}

// --------------------------------------------------------------- the loop ---

const source = flatten(readJson(sourcePath));
const sourceKeys = Object.keys(source);
const hashes = existsSync(hashPath) ? readJson(hashPath) : {};

console.log(`\nSource: ${sourceKeys.length} strings in messages/en.json`);

let anyFailed = false;

for (const locale of targets) {
  const targetPath = resolve(messagesDir, `${locale}.json`);
  const existing = existsSync(targetPath)
    ? flatten(readJson(targetPath))
    : {};
  const localeHashes = hashes[locale] ?? {};

  const stale = sourceKeys.filter(
    (key) =>
      typeof existing[key] !== "string" || localeHashes[key] !== hash(source[key])
  );

  // Keys that were removed from English shouldn't linger in the translations.
  const dropped = Object.keys(existing).filter((k) => !(k in source));

  if (!stale.length && !dropped.length) {
    console.log(`\n${locale}: up to date (${sourceKeys.length} strings)`);
    continue;
  }

  console.log(
    `\n${locale}: translating ${stale.length}` +
      (dropped.length ? `, removing ${dropped.length} stale` : "") +
      ` (${sourceKeys.length - stale.length} reused)`
  );

  const result = {};
  const nextHashes = {};
  for (const key of sourceKeys) {
    if (!stale.includes(key)) {
      result[key] = existing[key];
      nextHashes[key] = localeHashes[key];
    } else if (typeof existing[key] === "string") {
      // Seed stale keys with their previous translation and no hash. If the
      // batch succeeds this is overwritten; if it fails the file keeps a
      // slightly-out-of-date string instead of losing it, and the missing hash
      // means the next run retries the key.
      result[key] = existing[key];
    }
  }

  for (let i = 0; i < stale.length; i += BATCH_SIZE) {
    const slice = stale.slice(i, i + BATCH_SIZE);
    const entries = slice.map((key) => [key, source[key]]);
    const batchNo = Math.floor(i / BATCH_SIZE) + 1;
    const batchCount = Math.ceil(stale.length / BATCH_SIZE);
    process.stdout.write(`  batch ${batchNo}/${batchCount} … `);

    let translated;
    try {
      translated = await translateBatch(locale, entries);
    } catch (error) {
      console.log("failed");
      console.error(`    ${error.message}`);
      anyFailed = true;
      continue;
    }

    let ok = 0;
    for (const [key, english] of entries) {
      const value = translated.get(key);
      if (typeof value !== "string") {
        console.error(`\n    missing translation for ${key}`);
        anyFailed = true;
        continue;
      }

      if (!samePlaceholders(english, value)) {
        console.error(
          `\n    placeholder mismatch on ${key}\n` +
            `      en → ${formatPlaceholders(english)}\n` +
            `      ${locale} → ${formatPlaceholders(value)}`
        );
        anyFailed = true;
        continue;
      }

      result[key] = value;
      nextHashes[key] = hash(english);
      ok += 1;
    }
    console.log(`${ok}/${entries.length}`);
  }

  writeFileSync(targetPath, JSON.stringify(unflatten(result), null, 2) + "\n");
  hashes[locale] = nextHashes;
  console.log(`  wrote messages/${locale}.json`);
}

writeFileSync(hashPath, JSON.stringify(hashes, null, 2) + "\n");

if (anyFailed) {
  console.error(
    "\nSome strings did not translate. The file was still written with " +
      "everything that succeeded — re-run to pick up the rest.\n"
  );
  process.exit(1);
}

console.log("\nDone.\n");
