import chalk from "chalk";
import { findTask, removeTask, updateTaskStatus } from "../models/queue.js";
import { withLock, type QueueScope } from "../store/fileStore.js";

export async function doneCommand(
  taskId: string,
  scope: QueueScope,
): Promise<void> {
  await withLock(scope, async (queue) => {
    const task = findTask(queue, taskId);
    if (!task) {
      console.error(chalk.red(`Task not found: ${taskId}`));
      process.exit(1);
    }
    return { queue: removeTask(queue, taskId), result: undefined };
  });

  console.log(chalk.green("Done:"), taskId);
}

export async function failCommand(
  taskId: string,
  scope: QueueScope,
): Promise<void> {
  await withLock(scope, async (queue) => {
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
