import { useCallback } from "react";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export function useEditor() {
  const openEditor = useCallback((initialValue: string = ""): string | null => {
    const editor = process.env.EDITOR || process.env.VISUAL || "vi";
    const tmpFile = path.join(os.tmpdir(), `codo-${Date.now()}.md`);

    fs.writeFileSync(tmpFile, initialValue);

    const result = spawnSync(editor, [tmpFile], {
      stdio: "inherit",
    });

    if (result.status !== 0) {
      try { fs.unlinkSync(tmpFile); } catch {}
      return null;
    }

    const content = fs.readFileSync(tmpFile, "utf-8").trim();
    try { fs.unlinkSync(tmpFile); } catch {}

    return content || null;
  }, []);

  return { openEditor };
}
