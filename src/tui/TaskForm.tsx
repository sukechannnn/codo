import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface Props {
  mode: "add" | "edit";
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function TaskForm({ mode, initialValue = "", onSubmit, onCancel }: Props) {
  const [value, setValue] = useState(initialValue);
  const [cursor, setCursor] = useState(initialValue.length);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
      }
      return;
    }
    if (key.leftArrow) {
      setCursor((c) => Math.max(0, c - 1));
      return;
    }
    if (key.rightArrow) {
      setCursor((c) => Math.min(value.length, c + 1));
      return;
    }
    if (key.backspace || key.delete) {
      if (cursor > 0) {
        setValue((v) => v.slice(0, cursor - 1) + v.slice(cursor));
        setCursor((c) => c - 1);
      }
      return;
    }
    // Ctrl+A: move cursor to start
    if (key.ctrl && input === "a") {
      setCursor(0);
      return;
    }
    // Ctrl+E: move cursor to end
    if (key.ctrl && input === "e") {
      setCursor(value.length);
      return;
    }
    // Ctrl+W: delete word before cursor
    if (key.ctrl && input === "w") {
      const before = value.slice(0, cursor);
      const trimmed = before.replace(/\s+$/, "");
      const lastSpace = trimmed.lastIndexOf(" ");
      const newCursor = lastSpace === -1 ? 0 : lastSpace + 1;
      setValue(value.slice(0, newCursor) + value.slice(cursor));
      setCursor(newCursor);
      return;
    }
    // Ctrl+U: delete from cursor to start
    if (key.ctrl && input === "u") {
      setValue(value.slice(cursor));
      setCursor(0);
      return;
    }
    // Ctrl+K: delete from cursor to end
    if (key.ctrl && input === "k") {
      setValue(value.slice(0, cursor));
      return;
    }
    if (input && !key.ctrl && !key.meta) {
      setValue((v) => v.slice(0, cursor) + input + v.slice(cursor));
      setCursor((c) => c + input.length);
    }
  });

  const label = mode === "add" ? "New task" : "Edit task";
  const before = value.slice(0, cursor);
  const cursorChar = value[cursor] ?? " ";
  const after = value.slice(cursor + 1);

  return (
    <Box paddingX={1} paddingY={1}>
      <Text>
        <Text bold color="cyan">{label}: </Text>
        <Text>{before}</Text>
        <Text inverse>{cursorChar}</Text>
        <Text>{after}</Text>
      </Text>
    </Box>
  );
}
