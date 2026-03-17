import React from "react";
import { Box, Text } from "ink";
import type { Task } from "../models/task.js";
import type { HistoryEntry } from "../models/history.js";

interface Props {
  tasks: Task[];
  selectedIndex: number;
  recentHistory: HistoryEntry[];
}

export function TaskList({ tasks, selectedIndex, recentHistory }: Props) {
  return (
    <Box flexDirection="column" paddingX={1}>
      {recentHistory.length > 0 && (
        <>
          <Text bold dimColor>Recent</Text>
          {recentHistory.map((entry) => {
            const icon = entry.result === "done" ? "✓" : "✗";
            const color = entry.result === "done" ? "green" : "gray";
            const truncated =
              entry.instruction.length > 50
                ? entry.instruction.slice(0, 50) + "…"
                : entry.instruction;
            return (
              <Box key={entry.id + entry.completedAt}>
                <Text dimColor>  </Text>
                <Text color={color}>{icon}</Text>
                <Text dimColor>  {truncated}</Text>
              </Box>
            );
          })}
          <Text dimColor>{"  " + "─".repeat(60)}</Text>
        </>
      )}
      {tasks.length === 0 ? (
        <Box paddingY={1}>
          <Text dimColor>Queue is empty. Press [a] to add a task.</Text>
        </Box>
      ) : (
        <>
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
        </>
      )}
    </Box>
  );
}
