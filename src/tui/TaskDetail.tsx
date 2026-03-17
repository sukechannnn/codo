import React from "react";
import { Box, Text, useInput } from "ink";
import type { Task } from "../models/task.js";

interface Props {
  task: Task;
  onClose: () => void;
}

export function TaskDetail({ task, onClose }: Props) {
  useInput((_input, key) => {
    if (key.return || key.escape) {
      onClose();
    }
  });
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold>Task Detail</Text>
        <Text dimColor> (press Enter or Esc to close)</Text>
      </Box>
      <Box>
        <Text dimColor>ID: </Text>
        <Text>{task.id}</Text>
      </Box>
      <Box>
        <Text dimColor>Status: </Text>
        <Text color={task.status === "in_progress" ? "yellow" : undefined}>
          {task.status}
        </Text>
      </Box>
      <Box>
        <Text dimColor>CWD: </Text>
        <Text>{task.cwd}</Text>
      </Box>
      <Box>
        <Text dimColor>Created: </Text>
        <Text>{task.createdAt}</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Instruction:</Text>
        <Text>{task.instruction}</Text>
      </Box>
    </Box>
  );
}
