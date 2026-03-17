import chalk from "chalk";
import { findTask, removeTask, updateTaskStatus } from "../models/queue.js";
import { addHistoryEntry, type HistoryEntry } from "../models/history.js";
import { withLock, readHistory, writeHistory } from "../store/fileStore.js";

export async function doneCommand(taskId: string): Promise<void> {
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
    result: "done",
    createdAt: task.createdAt,
    completedAt: new Date().toISOString(),
  };
  const history = await readHistory();
  await writeHistory(addHistoryEntry(history, entry));

  console.log(chalk.green("Done:"), taskId);
}

export async function failCommand(taskId: string): Promise<void> {
  await withLock(async (queue) => {
    const task = findTask(queue, taskId);
    if (!task) {
      console.error(chalk.red(`Task not found: ${taskId}`));
      process.exit(1);
    }
    return {
      queue: updateTaskStatus(queue, taskId, "pending"),
      result: undefined,
    };
  });

  console.log(chalk.yellow("Reset to pending:"), taskId);
}
