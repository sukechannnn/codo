import chalk from "chalk";
import { getNextPendingTask, updateTaskStatus } from "../models/queue.js";
import { withLock, type QueueScope } from "../store/fileStore.js";
import type { Task } from "../models/task.js";

export async function nextCommand(scope: QueueScope): Promise<void> {
  const task = await withLock(scope, async (queue) => {
    const next = getNextPendingTask(queue);
    if (!next) {
      return { queue, result: null as Task | null };
    }
    const updated = updateTaskStatus(queue, next.id, "in_progress");
    return { queue: updated, result: next as Task | null };
  });

  if (!task) {
    console.error(chalk.dim("No tasks in queue"));
    process.exit(1);
  }

  console.log(JSON.stringify({ id: task.id, instruction: task.instruction, cwd: task.cwd }));
}
