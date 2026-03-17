import chalk from "chalk";
import { findTask, moveTask, removeTask } from "../models/queue.js";
import { withLock, type QueueScope } from "../store/fileStore.js";

export async function moveCommand(
  taskId: string,
  to: number,
  scope: QueueScope,
): Promise<void> {
  await withLock(scope, async (queue) => {
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

export async function rmCommand(
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

  console.log(chalk.green("Removed:"), taskId);
}
