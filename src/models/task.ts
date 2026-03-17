import { z } from "zod";

export const TaskStatus = z.enum(["pending", "in_progress"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskSchema = z.object({
  id: z.string(),
  instruction: z.string(),
  status: TaskStatus,
  cwd: z.string(),
  createdAt: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;
