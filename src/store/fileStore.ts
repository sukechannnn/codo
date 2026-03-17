import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import lockfile from "proper-lockfile";
import { QueueSchema, createEmptyQueue, type Queue } from "../models/queue.js";

const GLOBAL_DIR = path.join(os.homedir(), ".cc-todo");
const GLOBAL_QUEUE_FILE = path.join(GLOBAL_DIR, "queue.json");
const LOCAL_DIR = ".cc-todo";
const LOCAL_QUEUE_FILE = path.join(LOCAL_DIR, "queue.json");

export type QueueScope = "global" | "project";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveScope(): Promise<QueueScope> {
  return (await fileExists(LOCAL_QUEUE_FILE)) ? "project" : "global";
}

function getQueuePath(scope: QueueScope): string {
  return scope === "global" ? GLOBAL_QUEUE_FILE : LOCAL_QUEUE_FILE;
}

function getDirPath(scope: QueueScope): string {
  return scope === "global" ? GLOBAL_DIR : LOCAL_DIR;
}

async function ensureDir(scope: QueueScope): Promise<void> {
  await fs.mkdir(getDirPath(scope), { recursive: true });
}

async function ensureQueueFile(scope: QueueScope): Promise<void> {
  const filePath = getQueuePath(scope);
  await ensureDir(scope);
  if (!(await fileExists(filePath))) {
    await fs.writeFile(filePath, JSON.stringify(createEmptyQueue(), null, 2));
  }
}

export async function readQueue(scope: QueueScope): Promise<Queue> {
  await ensureQueueFile(scope);
  const filePath = getQueuePath(scope);
  const content = await fs.readFile(filePath, "utf-8");
  return QueueSchema.parse(JSON.parse(content));
}

export async function writeQueue(
  queue: Queue,
  scope: QueueScope,
): Promise<void> {
  await ensureQueueFile(scope);
  const filePath = getQueuePath(scope);
  await fs.writeFile(filePath, JSON.stringify(queue, null, 2) + "\n");
}

export async function withLock<T>(
  scope: QueueScope,
  fn: (queue: Queue) => Promise<{ queue: Queue; result: T }>,
): Promise<T> {
  await ensureQueueFile(scope);
  const filePath = getQueuePath(scope);
  const release = await lockfile.lock(filePath, {
    retries: { retries: 3, minTimeout: 100, maxTimeout: 1000 },
  });
  try {
    const queue = await readQueue(scope);
    const { queue: newQueue, result } = await fn(queue);
    await writeQueue(newQueue, scope);
    return result;
  } finally {
    await release();
  }
}
