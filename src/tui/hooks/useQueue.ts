import { useState, useEffect, useCallback, useRef } from "react";
import type { Queue } from "../../models/queue.js";
import {
  addTask,
  removeTask,
  updateTaskStatus,
  moveTask,
  createEmptyQueue,
} from "../../models/queue.js";
import type { Task } from "../../models/task.js";
import {
  readQueue,
  readHistory,
  writeHistory,
  withLock,
} from "../../store/fileStore.js";
import {
  addHistoryEntry,
  type HistoryEntry,
} from "../../models/history.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export function useQueue() {
  const [queue, setQueue] = useState<Queue>(createEmptyQueue());

  const reload = useCallback(async () => {
    const q = await readQueue();
    setQueue(q);
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 2000);
    return () => clearInterval(interval);
  }, [reload]);

  const add = useCallback(
    async (instruction: string) => {
      await withLock(async (q) => {
        const task: Task = {
          id: nanoid(),
          instruction,
          status: "pending",
          cwd: process.cwd(),
          createdAt: new Date().toISOString(),
        };
        const updated = addTask(q, task);
        return { queue: updated, result: undefined };
      });
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (taskId: string) => {
      const task = await withLock(async (q) => {
        const found = q.tasks.find((t) => t.id === taskId);
        return { queue: removeTask(q, taskId), result: found ?? null };
      });
      if (task) {
        const entry: HistoryEntry = {
          id: task.id,
          instruction: task.instruction,
          cwd: task.cwd,
          result: "removed",
          createdAt: task.createdAt,
          completedAt: new Date().toISOString(),
        };
        const history = await readHistory();
        await writeHistory(addHistoryEntry(history, entry));
      }
      await reload();
    },
    [reload],
  );

  const move = useCallback(
    async (taskId: string, toIndex: number) => {
      await withLock(async (q) => ({
        queue: moveTask(q, taskId, toIndex),
        result: undefined,
      }));
      await reload();
    },
    [reload],
  );

  const edit = useCallback(
    async (taskId: string, instruction: string) => {
      await withLock(async (q) => ({
        queue: {
          ...q,
          tasks: q.tasks.map((t) =>
            t.id === taskId ? { ...t, instruction } : t,
          ),
        },
        result: undefined,
      }));
      await reload();
    },
    [reload],
  );

  return { queue, reload, add, remove, move, edit };
}
