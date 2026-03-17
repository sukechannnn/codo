import chalk from "chalk";
import { getNextPendingTask, updateTaskStatus } from "../models/queue.js";
import { withLock } from "../store/fileStore.js";
import type { Task } from "../models/task.js";

const POLL_INTERVAL_MS = 10_000;

async function tryNext(): Promise<Task | null> {
  return withLock(async (queue) => {
    const next = getNextPendingTask(queue);
    if (!next) {
      return { queue, result: null as Task | null };
    }
    const updated = updateTaskStatus(queue, next.id, "in_progress");
    return { queue: updated, result: next as Task | null };
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function nextCommand(
  options: { wait?: number } = {},
): Promise<void> {
  const task = await tryNext();

  if (task) {
    console.log(JSON.stringify({ id: task.id, instruction: task.instruction, cwd: task.cwd }));
    return;
  }

  if (!options.wait) {
    console.error(chalk.dim("No tasks in queue"));
    process.exit(1);
  }

  const deadlineMs = options.wait * 60 * 1000;
  const start = Date.now();
  console.error(chalk.dim(`Waiting for tasks... (timeout: ${options.wait}m)`));

  while (Date.now() - start < deadlineMs) {
    await sleep(POLL_INTERVAL_MS);
    const found = await tryNext();
    if (found) {
      console.log(JSON.stringify({ id: found.id, instruction: found.instruction, cwd: found.cwd }));
      return;
    }
  }

  console.error(chalk.dim("Timed out waiting for tasks"));
  process.exit(1);
}
