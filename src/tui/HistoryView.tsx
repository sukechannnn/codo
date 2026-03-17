import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { History, HistoryEntry } from "../models/history.js";

interface Props {
  history: History;
  onClose: () => void;
}

function HistoryDetail({ entry, onClose }: { entry: HistoryEntry; onClose: () => void }) {
  useInput((_input, key) => {
    if (key.return || key.escape) {
      onClose();
    }
  });

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Box marginBottom={1}>
        <Text bold>History Detail</Text>
        <Text dimColor> (press Enter or Esc to close)</Text>
      </Box>
      <Box>
        <Text dimColor>ID: </Text>
        <Text>{entry.id}</Text>
      </Box>
      <Box>
        <Text dimColor>Result: </Text>
        <Text color={entry.result === "done" ? "green" : undefined}>
          {entry.result}
        </Text>
      </Box>
      <Box>
        <Text dimColor>CWD: </Text>
        <Text>{entry.cwd}</Text>
      </Box>
      <Box>
        <Text dimColor>Created: </Text>
        <Text>{entry.createdAt}</Text>
      </Box>
      <Box>
        <Text dimColor>Completed: </Text>
        <Text>{entry.completedAt}</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Instruction:</Text>
        <Text>{entry.instruction}</Text>
      </Box>
    </Box>
  );
}

export function HistoryView({ history, onClose }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const entries = history.entries;

  useInput(
    (_input, key) => {
      if (key.escape || _input === "h" || _input === "q") {
        onClose();
        return;
      }
      if (_input === "j" || key.downArrow) {
        setSelectedIndex((i) => Math.min(i + 1, entries.length - 1));
        return;
      }
      if (_input === "k" || key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (key.return && entries.length > 0) {
        setShowDetail(true);
        return;
      }
    },
    { isActive: !showDetail },
  );

  if (entries.length === 0) {
    return (
      <Box flexDirection="column" paddingX={1} paddingY={1}>
        <Text dimColor>No history yet. Press [h] or [Esc] to go back.</Text>
      </Box>
    );
  }

  if (showDetail) {
    return (
      <HistoryDetail
        entry={entries[selectedIndex]}
        onClose={() => setShowDetail(false)}
      />
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <Text bold>History</Text>
        <Text dimColor> ({entries.length} entries, [Enter] detail, [h/Esc] close)</Text>
      </Box>
      <Box>
        <Text bold>
          {"     Result    Completed             Instruction"}
        </Text>
      </Box>
      <Text dimColor>{"     " + "─".repeat(60)}</Text>
      {entries.map((entry, i) => {
        const selected = i === selectedIndex;
        const marker = selected ? "▸ " : "  ";
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
            <Text color={selected ? "cyan" : undefined}>{marker}</Text>
            <Text>
              {resultLabel}
              {"  "}
              <Text dimColor>{date}</Text>
              {"  "}
              {truncated}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
