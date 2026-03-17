import chalk from "chalk";
import { findTask, moveTask, removeTask } from "../models/queue.js";
import { addHistoryEntry, type HistoryEntry } from "../models/history.js";
import { withLock, readHistory, writeHistory } from "../store/fileStore.js";

export async function moveCommand(
  taskId: string,
  to: number,
): Promise<void> {
  await withLock(async (queue) => {
    const task = findTask(queue, taskId);
    if (!task) {
      console.error(chalk.red(`Task not found: ${taskId}`));
      process.exit(1);
    }
    // CLI uses 1-based index, internal is 0-based
    return { queue: moveTask(queue, taskId, to - 1), result: undefined };
  });

  console.log(chalk.green("Moved:"), taskId, `-> position ${to}`);
}

export async function rmCommand(taskId: string): Promise<void> {
  const task = await withLock(async (queue) => {
    const found = findTask(queue, taskId);
    if (!found) {
      console.error(chalk.red(`Task not found: ${taskId}`));
      process.exit(1);
    }
    return { queue: removeTask(queue, taskId), result: found };
  });

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

  console.log(chalk.green("Removed:"), taskId);
}
