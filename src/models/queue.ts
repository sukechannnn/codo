import { z } from "zod";
import { TaskSchema, type Task } from "./task.js";

export const QueueSchema = z.object({
  version: z.literal(1),
  tasks: z.array(TaskSchema),
});
export type Queue = z.infer<typeof QueueSchema>;

export function createEmptyQueue(): Queue {
  return { version: 1, tasks: [] };
}

export function addTask(queue: Queue, task: Task): Queue {
  return { ...queue, tasks: [...queue.tasks, task] };
}

export function removeTask(queue: Queue, taskId: string): Queue {
  return { ...queue, tasks: queue.tasks.filter((t) => t.id !== taskId) };
}

export function findTask(queue: Queue, taskId: string): Task | undefined {
  return queue.tasks.find((t) => t.id === taskId);
}

export function updateTaskStatus(
  queue: Queue,
  taskId: string,
  status: Task["status"],
): Queue {
  return {
    ...queue,
    tasks: queue.tasks.map((t) =>
      t.id === taskId ? { ...t, status } : t,
    ),
  };
}

export function moveTask(queue: Queue, taskId: string, toIndex: number): Queue {
  const tasks = [...queue.tasks];
  const fromIndex = tasks.findIndex((t) => t.id === taskId);
  if (fromIndex === -1) return queue;

  const target = Math.max(0, Math.min(toIndex, tasks.length - 1));
  const [task] = tasks.splice(fromIndex, 1);
  tasks.splice(target, 0, task);
  return { ...queue, tasks };
}

export function getNextPendingTask(queue: Queue): Task | undefined {
  return queue.tasks.find((t) => t.status === "pending");
}
