# codo

Task queue manager for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Queue up tasks and let Claude Code execute them sequentially.

## Install

```bash
npm install -g @sukechannnn/codo
```

This installs the `codo` command and the `/codo` Claude Code skill.

## Quick Start

1. Launch the TUI to add tasks:

```bash
codo
```

2. In another terminal, start Claude Code and run:

```
/codo
```

Claude Code picks up tasks from the queue, executes them one by one, and waits for new tasks if the queue is empty. You can keep adding tasks from the TUI while Claude Code is working.

## CLI Reference

```bash
codo                        # Launch TUI
codo add <instruction>      # Add a task
codo list                   # List tasks
codo next                   # Get next task (used by CC skill)
codo done <task-id>         # Mark as done
codo fail <task-id>         # Mark as failed
codo rm <task-id>           # Remove a task
codo move <task-id> --to N  # Reorder a task
```

## License

MIT
