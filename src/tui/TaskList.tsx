import React from "react";
import { Box, Text } from "ink";
import type { Task } from "../models/task.js";

interface Props {
  tasks: Task[];
  selectedIndex: number;
}

export function TaskList({ tasks, selectedIndex }: Props) {
  if (tasks.length === 0) {
    return (
      <Box paddingX={1} paddingY={1}>
        <Text dimColor>Queue is empty. Press [a] to add a task.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box>
        <Text bold>
          {"     #  ID        Status   Instruction"}
        </Text>
      </Box>
      <Text dimColor>{"     " + "─".repeat(60)}</Text>
      {tasks.map((task, i) => {
        const selected = i === selectedIndex;
        const marker = selected ? "▸ " : "  ";
        const num = String(i + 1).padStart(2);
        const id = task.id.slice(0, 8).padEnd(8);
        const statusLabel =
          task.status === "in_progress" ? "▶ RUN " : "○ PEND";
        const statusColor =
          task.status === "in_progress" ? "yellow" : undefined;
        const truncated =
          task.instruction.length > 40
            ? task.instruction.slice(0, 40) + "…"
            : task.instruction;

        return (
          <Box key={task.id}>
            <Text color={selected ? "cyan" : undefined}>{marker}</Text>
            <Text>
              {num}{"  "}
              <Text dimColor>{id}</Text>
              {"  "}
              <Text color={statusColor}>{statusLabel}</Text>
              {"  "}
              {truncated}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
