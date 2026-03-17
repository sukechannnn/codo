import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import lockfile from "proper-lockfile";
import { QueueSchema, createEmptyQueue, type Queue } from "../models/queue.js";
import {
  HistorySchema,
  createEmptyHistory,
  type History,
} from "../models/history.js";

const GLOBAL_DIR = path.join(os.homedir(), ".codo");
const GLOBAL_QUEUE_FILE = path.join(GLOBAL_DIR, "queue.json");
const GLOBAL_HISTORY_FILE = path.join(GLOBAL_DIR, "history.json");

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function getQueuePath(): string {
  return GLOBAL_QUEUE_FILE;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(GLOBAL_DIR, { recursive: true });
}

async function ensureQueueFile(): Promise<void> {
  const filePath = GLOBAL_QUEUE_FILE;
  await ensureDir();
  if (!(await fileExists(filePath))) {
    await fs.writeFile(filePath, JSON.stringify(createEmptyQueue(), null, 2));
  }
}

export async function readQueue(): Promise<Queue> {
  await ensureQueueFile();
  const content = await fs.readFile(GLOBAL_QUEUE_FILE, "utf-8");
  return QueueSchema.parse(JSON.parse(content));
}

export async function writeQueue(queue: Queue): Promise<void> {
  await ensureQueueFile();
  await fs.writeFile(GLOBAL_QUEUE_FILE, JSON.stringify(queue, null, 2) + "\n");
}

export function getHistoryPath(): string {
  return GLOBAL_HISTORY_FILE;
}

export async function readHistory(): Promise<History> {
  await ensureDir();
  try {
    const content = await fs.readFile(GLOBAL_HISTORY_FILE, "utf-8");
    return HistorySchema.parse(JSON.parse(content));
  } catch {
    return createEmptyHistory();
  }
}

export async function writeHistory(history: History): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    GLOBAL_HISTORY_FILE,
    JSON.stringify(history, null, 2) + "\n",
  );
}

export async function withLock<T>(
  fn: (queue: Queue) => Promise<{ queue: Queue; result: T }>,
): Promise<T> {
  await ensureQueueFile();
  const release = await lockfile.lock(GLOBAL_QUEUE_FILE, {
    retries: { retries: 3, minTimeout: 100, maxTimeout: 1000 },
  });
  try {
    const queue = await readQueue();
    const { queue: newQueue, result } = await fn(queue);
    await writeQueue(newQueue);
    return result;
  } finally {
    await release();
  }
}
