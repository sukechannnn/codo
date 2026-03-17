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

const MAX_ENTRIES = 100;

export function createEmptyHistory(): History {
  return { entries: [] };
}

export function addHistoryEntry(history: History, entry: HistoryEntry): History {
  const entries = [entry, ...history.entries].slice(0, MAX_ENTRIES);
  return { entries };
}
