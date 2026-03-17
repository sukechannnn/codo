#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const skillSrc = path.resolve(
  new URL(".", import.meta.url).pathname,
  "..",
  "skills",
  "codo",
);
const skillDest = path.join(os.homedir(), ".claude", "skills", "codo");

// Create ~/.claude/skills/ if it doesn't exist
fs.mkdirSync(path.dirname(skillDest), { recursive: true });

// Remove existing symlink or directory
try {
  const stat = fs.lstatSync(skillDest);
  if (stat.isSymbolicLink()) {
    fs.unlinkSync(skillDest);
  } else if (stat.isDirectory()) {
    fs.rmSync(skillDest, { recursive: true });
  }
} catch {
  // Does not exist, ignore
}

fs.symlinkSync(skillSrc, skillDest, "dir");
console.log(`cc-todo: Skill installed -> ${skillDest}`);
