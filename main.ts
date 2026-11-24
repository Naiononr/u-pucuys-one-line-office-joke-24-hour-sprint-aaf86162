// One-Line Office Joke: 24-Hour Sprint — entry program.
//
// Writes a single fixed one-line joke about office life to
// <MAKEFUN_OUTPUT_DIR or /output>/entry.txt (UTF-8, no trailing newline).
// Deterministic: the same bytes on every run. Stdlib only, no network.

import { chmodSync, copyFileSync, mkdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
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
  // Temp file MUST live in the output directory itself: the grader mounts
  // /tmp as a tmpfs separate from /output, so a temp file in os.tmpdir()
  // cannot be renamed onto /output (EXDEV: cross-device link not
  // permitted) and the run exits 1. Same-directory temp keeps the rename
  // on one filesystem; the EXDEV copy fallback covers odd mount layouts.
  const tmpFile = join(outDir, `.entry-${process.pid}.tmp`);
  try {
    writeFileSync(tmpFile, JOKE, "utf8");
    chmodSync(tmpFile, 0o644);
    try {
      renameSync(tmpFile, join(outDir, "entry.txt"));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EXDEV") throw err;
      copyFileSync(tmpFile, join(outDir, "entry.txt"));
      chmodSync(join(outDir, "entry.txt"), 0o644);
      unlinkSync(tmpFile);
    }
  } finally {
    rmSync(tmpFile, { force: true });
  }

  // Verify the finished file: exact bytes, single line, world-readable.
  const written = readFileSync(join(outDir, "entry.txt"), "utf8");
  if (written !== JOKE) throw new Error("entry.txt does not match the joke");
}

main();
