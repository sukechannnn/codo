# codo

Task queue manager for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Queue up tasks and let Claude Code execute them sequentially.

## How it works

```
┌──────────────┐          ┌──────────────┐
│  codo (TUI)  │          │  Claude Code  │
│              │          │               │
│  Add tasks   │  ←JSON→  │  /codo        │
│  Reorder     │   File   │  → Pick task  │
│  Edit/Delete │          │  → Execute    │
│  View history│          │  → Done/Fail  │
└──────────────┘          └──────────────┘
        ↕
  ~/.codo/queue.json
```

- **TUI/CLI**: Manage your task queue
- **CC Skill** (`/codo`): Claude Code picks up tasks, executes them, and moves to the next one

## Install

```bash
npm install -g codo
```

This installs:
- `codo` CLI command
- `/codo` Claude Code skill (symlinked to `~/.claude/skills/codo`)

## Usage

### CLI

```bash
# Add a task
codo add "Add email validation to user.rb with RSpec tests"

# List tasks
codo list

# Get next task (used by CC skill)
codo next
codo next --wait 10  # wait up to 10 minutes for a task

# Complete / fail / remove a task
codo done <task-id>
codo fail <task-id>
codo rm <task-id>

# Reorder a task
codo move <task-id> --to 1
```

### TUI

```bash
codo  # launch TUI
```

| Key | Action |
|-----|--------|
| `a` | Add task (inline) |
| `A` | Add task ($EDITOR) |
| `e` | Edit task (inline) |
| `E` | Edit task ($EDITOR) |
| `d` | Delete task |
| `K` / `J` | Move task up/down |
| `k` / `j` / `↑` / `↓` | Cursor movement |
| `Enter` | Expand task detail |
| `h` | View history |
| `q` / `Esc` | Quit |

### Claude Code Skill

In a Claude Code session:

```
/codo
```

Claude Code will:
1. Pick the next pending task from the queue
2. Execute the instruction
3. Mark it as done (or fail)
4. Move to the next task
5. Wait up to 10 minutes if the queue is empty

You can add tasks from another terminal while Claude Code is working.

## Data

All data is stored in `~/.codo/`:
- `queue.json` — active task queue
- `history.json` — last 100 completed/removed tasks

## License

MIT
