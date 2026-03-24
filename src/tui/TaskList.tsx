import React from "react";
import { Box, Text } from "ink";
import type { Task } from "../models/task.js";
import type { HistoryEntry } from "../models/history.js";

interface Props {
  tasks: Task[];
  selectedIndex: number;
  recentHistory: HistoryEntry[];
  maxRows: number;
}

export const TaskList = React.memo(function TaskList({ tasks, selectedIndex, recentHistory, maxRows }: Props) {
  // Calculate how many rows the recent history section uses
  const recentRows = recentHistory.length > 0 ? recentHistory.length + 2 : 0; // header + entries + separator
  // header(1) + separator(1) = 2 for task list header
  const taskHeaderRows = tasks.length > 0 ? 2 : 1;
  const availableForTasks = maxRows - recentRows - taskHeaderRows;

  // Window the visible tasks around the selected index
  let visibleStart = 0;
  let visibleEnd = tasks.length;
  if (tasks.length > availableForTasks) {
    const half = Math.floor(availableForTasks / 2);
    visibleStart = Math.max(0, selectedIndex - half);
    visibleEnd = visibleStart + availableForTasks;
    if (visibleEnd > tasks.length) {
      visibleEnd = tasks.length;
      visibleStart = Math.max(0, visibleEnd - availableForTasks);
    }
  }
  const visibleTasks = tasks.slice(visibleStart, visibleEnd);

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
          {visibleTasks.map((task, vi) => {
            const i = visibleStart + vi;
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
});
