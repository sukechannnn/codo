import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { useQueue } from "./hooks/useQueue.js";
import { useEditor } from "./hooks/useEditor.js";
import { StatusBar } from "./StatusBar.js";
import { TaskList } from "./TaskList.js";
import { TaskDetail } from "./TaskDetail.js";
import { TaskForm } from "./TaskForm.js";
import { HistoryView } from "./HistoryView.js";

type Mode = "list" | "add" | "edit" | "detail" | "confirm-delete" | "history";

export function App() {
  const [mode, setMode] = useState<Mode>("list");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { queue, history, add, remove, move, edit } = useQueue();
  const { openEditor } = useEditor();
  const { exit } = useApp();

  const selectedTask =
    queue.tasks.length > 0 ? queue.tasks[selectedIndex] : undefined;

  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(index, queue.tasks.length - 1)),
    [queue.tasks.length],
  );

  const recentHistory = history.entries.slice(0, 3);

  useInput(
    (input, key) => {
      if (mode !== "list") return;

      if (input === "q" || key.escape) {
        exit();
        return;
      }

      // Cursor movement
      if (input === "k" || key.upArrow) {
        setSelectedIndex((i) => clampIndex(i - 1));
        return;
      }
      if (input === "j" || key.downArrow) {
        setSelectedIndex((i) => clampIndex(i + 1));
        return;
      }

      // Move task up/down
      if (input === "K" && selectedTask) {
        const newIndex = Math.max(0, selectedIndex - 1);
        move(selectedTask.id, newIndex).then(() => setSelectedIndex(newIndex));
        return;
      }
      if (input === "J" && selectedTask) {
        const newIndex = Math.min(queue.tasks.length - 1, selectedIndex + 1);
        move(selectedTask.id, newIndex).then(() => setSelectedIndex(newIndex));
        return;
      }

      // Actions
      if (input === "a") {
        setMode("add");
        return;
      }
      if (input === "e" && selectedTask) {
        setMode("edit");
        return;
      }
      if (input === "E" && selectedTask) {
        const result = openEditor(selectedTask.instruction);
        if (result) {
          edit(selectedTask.id, result);
        }
        return;
      }
      if (input === "A") {
        const result = openEditor();
        if (result) {
          add(result);
        }
        return;
      }
      if (input === "d" && selectedTask) {
        setMode("confirm-delete");
        return;
      }
      if (key.return && selectedTask) {
        setMode("detail");
        return;
      }

      // History
      if (input === "h") {
        setMode("history");
        return;
      }
    },
    { isActive: mode === "list" },
  );

  // Confirm delete mode
  useInput(
    (input, key) => {
      if (mode !== "confirm-delete") return;

      if (input === "y" && selectedTask) {
        remove(selectedTask.id).then(() => {
          setSelectedIndex((i) => clampIndex(Math.max(0, i - 1)));
          setMode("list");
        });
        return;
      }
      setMode("list");
    },
    { isActive: mode === "confirm-delete" },
  );

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray">
      <StatusBar queue={queue} />
      <Box
        borderStyle="single"
        borderTop
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        borderColor="gray"
      />

      {mode === "history" ? (
        <HistoryView history={history} onClose={() => setMode("list")} />
      ) : mode === "detail" && selectedTask ? (
        <TaskDetail task={selectedTask} onClose={() => setMode("list")} />
      ) : mode === "add" ? (
        <TaskForm
          mode="add"
          onSubmit={(instruction) => {
            add(instruction).then(() => {
              setSelectedIndex(queue.tasks.length);
              setMode("list");
            });
          }}
          onCancel={() => setMode("list")}
        />
      ) : mode === "edit" && selectedTask ? (
        <TaskForm
          mode="edit"
          initialValue={selectedTask.instruction}
          onSubmit={(instruction) => {
            edit(selectedTask.id, instruction).then(() => setMode("list"));
          }}
          onCancel={() => setMode("list")}
        />
      ) : (
        <>
          <TaskList
            tasks={queue.tasks}
            selectedIndex={selectedIndex}
            recentHistory={recentHistory}
          />
          {mode === "confirm-delete" && selectedTask && (
            <Box paddingX={1}>
              <Text color="red">
                Delete "{selectedTask.instruction.slice(0, 30)}"? [y/N]
              </Text>
            </Box>
          )}
        </>
      )}

      <Box
        borderStyle="single"
        borderTop
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        borderColor="gray"
      />
      <Box paddingX={1}>
        <Text dimColor>
          [a]dd [e]dit [d]el [K/J]move [Enter]expand [h]istory [A/E]$EDITOR [q]uit
        </Text>
      </Box>
    </Box>
  );
}
