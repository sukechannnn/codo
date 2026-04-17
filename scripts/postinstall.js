#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const skillsBase = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "skills",
);
const destBase = path.join(os.homedir(), ".claude", "skills");

// Create ~/.claude/skills/ if it doesn't exist
fs.mkdirSync(destBase, { recursive: true });

for (const name of ["codo", "codo-pop", "codo-all"]) {
  const src = path.join(skillsBase, name);
  const dest = path.join(destBase, name);

  // Remove existing symlink or directory
  try {
    const stat = fs.lstatSync(dest);
    if (stat.isSymbolicLink()) {
      fs.unlinkSync(dest);
    } else if (stat.isDirectory()) {
      fs.rmSync(dest, { recursive: true });
    }
  } catch {
    // Does not exist, ignore
  }

  fs.symlinkSync(src, dest, "dir");
  console.log(`codo: Skill installed -> ${dest}`);
}
