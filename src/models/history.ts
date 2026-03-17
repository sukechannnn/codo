import { z } from "zod";

export const HistoryEntrySchema = z.object({
  id: z.string(),
  instruction: z.string(),
  cwd: z.string(),
  result: z.enum(["done", "removed"]),
  createdAt: z.string(),
  completedAt: z.string(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const HistorySchema = z.object({
  entries: z.array(HistoryEntrySchema),
});
export type History = z.infer<typeof HistorySchema>;

const MAX_ENTRIES_PER_CWD = 100;

export function createEmptyHistory(): History {
  return { entries: [] };
}

export function addHistoryEntry(history: History, entry: HistoryEntry): History {
  const newEntries = [entry, ...history.entries];
  const countByCwd = new Map<string, number>();
  const entries = newEntries.filter((e) => {
    const count = countByCwd.get(e.cwd) ?? 0;
    if (count >= MAX_ENTRIES_PER_CWD) return false;
    countByCwd.set(e.cwd, count + 1);
    return true;
  });
  return { entries };
}
