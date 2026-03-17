import { Command } from "commander";
import { resolveScope } from "./store/fileStore.js";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { nextCommand } from "./commands/next.js";
import { doneCommand, failCommand } from "./commands/done.js";
import { moveCommand, rmCommand } from "./commands/move.js";

const program = new Command();

program
  .name("codo")
  .description("Claude Code task queue manager CLI")
  .version("0.1.0");

program
  .command("add")
  .description("Add a task")
  .argument("<instruction>", "Task instruction text")
  .action(async (instruction: string) => {
    const scope = await resolveScope();
    await addCommand(instruction, scope);
  });

program
  .command("list")
  .description("List all tasks")
  .action(async () => {
    const scope = await resolveScope();
    await listCommand(scope);
  });

program
  .command("next")
  .description("Get the next task and start")
  .action(async () => {
    const scope = await resolveScope();
    await nextCommand(scope);
  });

program
  .command("done")
  .description("Mark a task as done (remove from queue)")
  .argument("<task-id>", "Task ID")
  .action(async (taskId: string) => {
    const scope = await resolveScope();
    await doneCommand(taskId, scope);
  });

program
  .command("fail")
  .description("Mark a task as failed (reset to pending)")
  .argument("<task-id>", "Task ID")
  .action(async (taskId: string) => {
    const scope = await resolveScope();
    await failCommand(taskId, scope);
  });

program
  .command("move")
  .description("Reorder a task")
  .argument("<task-id>", "Task ID")
  .requiredOption("--to <position>", "Target position (1-based)")
  .action(async (taskId: string, opts) => {
    const scope = await resolveScope();
    await moveCommand(taskId, parseInt(opts.to, 10), scope);
  });

program
  .command("rm")
  .description("Remove a task")
  .argument("<task-id>", "Task ID")
  .action(async (taskId: string) => {
    const scope = await resolveScope();
    await rmCommand(taskId, scope);
  });

program.parse();
