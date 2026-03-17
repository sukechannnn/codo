import React from "react";
import { Box, Text, useInput } from "ink";
import type { History } from "../models/history.js";

interface Props {
  history: History;
  onClose: () => void;
}

export function HistoryView({ history, onClose }: Props) {
  const [offset, setOffset] = React.useState(0);
  const pageSize = 15;
  const entries = history.entries;
  const visible = entries.slice(offset, offset + pageSize);

  useInput((_input, key) => {
    if (key.escape || _input === "h" || _input === "q") {
      onClose();
      return;
    }
    if (_input === "j" || key.downArrow) {
      setOffset((o) => Math.min(o + 1, Math.max(0, entries.length - pageSize)));
      return;
    }
    if (_input === "k" || key.upArrow) {
      setOffset((o) => Math.max(0, o - 1));
      return;
    }
  });

  if (entries.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1} paddingY={1}>
        <Text dimColor>No history yet. Press [h] or [Esc] to go back.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <Text bold>History</Text>
        <Text dimColor> ({entries.length} entries, press [h] or [Esc] to close)</Text>
      </Box>
      <Box>
        <Text bold>
          {"  Result    Completed             Instruction"}
        </Text>
      </Box>
      <Text dimColor>{"  " + "─".repeat(60)}</Text>
      {visible.map((entry) => {
        const resultLabel =
          entry.result === "done"
            ? <Text color="green">{"✓ done   "}</Text>
            : <Text dimColor>{"✗ removed"}</Text>;
        const date = entry.completedAt.slice(0, 16).replace("T", " ");
        const truncated =
          entry.instruction.length > 35
            ? entry.instruction.slice(0, 35) + "…"
            : entry.instruction;

        return (
          <Box key={entry.id + entry.completedAt}>
            <Text>
              {"  "}
              {resultLabel}
              {"  "}
              <Text dimColor>{date}</Text>
              {"  "}
              {truncated}
            </Text>
          </Box>
        );
      })}
      {entries.length > pageSize && (
        <Box marginTop={1}>
          <Text dimColor>
            [{offset + 1}-{Math.min(offset + pageSize, entries.length)} of {entries.length}] j/k to scroll
          </Text>
        </Box>
      )}
    </Box>
  );
}
