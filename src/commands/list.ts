import chalk from "chalk";
import { readQueue } from "../store/fileStore.js";

export async function listCommand(): Promise<void> {
  const queue = await readQueue();

  if (queue.tasks.length === 0) {
    console.log(chalk.dim("Queue is empty"));
    return;
  }

  const header = `${chalk.bold("#")}  ${chalk.bold("ID".padEnd(10))} ${chalk.bold("Status".padEnd(8))} ${chalk.bold("Instruction")}`;
  console.log(header);
  console.log("─".repeat(70));

  queue.tasks.forEach((task, i) => {
    const num = String(i + 1).padStart(2);
    const id = chalk.dim(task.id.padEnd(10));
    const statusLabel =
      task.status === "in_progress"
        ? chalk.yellow("▶ RUN")
        : chalk.dim("○ PEND");
    const truncated =
      task.instruction.length > 45
        ? task.instruction.slice(0, 45) + "…"
        : task.instruction;
    console.log(`${num}  ${id} ${statusLabel.padEnd(16)} ${truncated}`);
  });
}
