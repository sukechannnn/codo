import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { nextCommand } from "./commands/next.js";
import { doneCommand, failCommand } from "./commands/done.js";
import { moveCommand, rmCommand } from "./commands/move.js";

async function launchTui() {
  const { render } = await import("ink");
  const { createElement } = await import("react");
  const { App } = await import("./tui/App.js");
  render(createElement(App));
}

const program = new Command();

program
  .name("codo")
  .description("Claude Code task queue manager CLI")
  .version("0.1.0")
  .action(async () => {
    await launchTui();
  });

program
  .command("add")
  .description("Add a task")
  .argument("<instruction>", "Task instruction text")
  .action(async (instruction: string) => {
    await addCommand(instruction);
  });

program
  .command("list")
  .description("List all tasks")
  .action(async () => {
    await listCommand();
  });

program
  .command("next")
  .description("Get the next task and start")
  .option("-w, --wait <minutes>", "Wait for tasks if queue is empty (minutes)")
  .action(async (opts) => {
    await nextCommand({
      wait: opts.wait ? parseInt(opts.wait, 10) : undefined,
    });
  });

program
  .command("done")
  .description("Mark a task as done (remove from queue)")
  .argument("<task-id>", "Task ID")
  .action(async (taskId: string) => {
    await doneCommand(taskId);
  });

program
  .command("fail")
  .description("Mark a task as failed (reset to pending)")
  .argument("<task-id>", "Task ID")
  .action(async (taskId: string) => {
    await failCommand(taskId);
  });

program
  .command("move")
  .description("Reorder a task")
  .argument("<task-id>", "Task ID")
  .requiredOption("--to <position>", "Target position (1-based)")
  .action(async (taskId: string, opts) => {
    await moveCommand(taskId, parseInt(opts.to, 10));
  });

program
  .command("rm")
  .description("Remove a task")
  .argument("<task-id>", "Task ID")
  .action(async (taskId: string) => {
    await rmCommand(taskId);
  });

program.parse();
