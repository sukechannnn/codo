import React from "react";
import { Box, Text } from "ink";
import type { Queue } from "../models/queue.js";

interface Props {
  queue: Queue;
}

export function StatusBar({ queue }: Props) {
  const pending = queue.tasks.filter((t) => t.status === "pending").length;
  const running = queue.tasks.filter((t) => t.status === "in_progress").length;

  return (
    <Box justifyContent="space-between" paddingX={1}>
      <Text bold>codo</Text>
      <Text>
        <Text>{pending} pending</Text>
        {running > 0 && (
          <Text>
            {" / "}
            <Text color="yellow">{running} running</Text>
          </Text>
        )}
      </Text>
    </Box>
  );
}
