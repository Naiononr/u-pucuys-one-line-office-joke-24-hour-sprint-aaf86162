// One-Line Office Joke: 24-Hour Sprint — entry program.
//
// Writes a single fixed one-line joke about office life to
// <MAKEFUN_OUTPUT_DIR or /output>/entry.txt (UTF-8, no trailing newline).
// Deterministic: the same bytes on every run. Stdlib only, no network.

import { chmodSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const JOKE =
  "The meeting could have been an email, the email could have been a Slack message, and the Slack message could have been silence.";

function main(): void {
  // Runtime self-check: the gate requires 1-200 chars, UTF-8, one line,
  // not only whitespace.
  if (JOKE.length < 1 || JOKE.length > 200) {
    throw new Error(`joke is ${JOKE.length} chars, must be 1-200`);
  }
  if (JOKE.trim().length === 0 || JOKE.includes("\n") || JOKE.includes("\r")) {
    throw new Error("joke must be a single non-blank line");
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), "office-joke-"));
  try {
    const tmpFile = join(tmp, "entry.txt");
    writeFileSync(tmpFile, JOKE, "utf8");
    chmodSync(tmpFile, 0o644);
    renameSync(tmpFile, join(outDir, "entry.txt"));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // Verify the finished file: exact bytes, single line, world-readable.
  const written = readFileSync(join(outDir, "entry.txt"), "utf8");
  if (written !== JOKE) throw new Error("entry.txt does not match the joke");
}

main();
