import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);
import chalk from "chalk";
import { type Task } from "../models/task.js";
import { addTask } from "../models/queue.js";
import { withLock, type QueueScope } from "../store/fileStore.js";

export async function addCommand(
  instruction: string,
  scope: QueueScope,
): Promise<void> {
  const task: Task = {
    id: nanoid(),
    instruction,
    status: "pending",
    cwd: process.cwd(),
    createdAt: new Date().toISOString(),
  };

  await withLock(scope, async (queue) => ({
    queue: addTask(queue, task),
    result: undefined,
  }));

  console.log(chalk.green("Added:"), task.id);
}
