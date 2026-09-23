"use client";

import type { GermanLevel, PublicLesson } from "@/infrastructure/catalog/lesson-content";
import { mergeOfflineMutation, type OfflineMutation } from "@/packages/domain/src/offline-sync";

const DATABASE_NAME = "language-guide-offline";
const DATABASE_VERSION = 1;
const LESSON_STORE = "lessons";
const MUTATION_STORE = "mutations";

export type OfflineLessonRecord = Readonly<{
  id: string;
  slug: string;
  route: string;
  title: string;
  summary: string;
  languageCode: "de";
  levelCode: GermanLevel;
  revision: number;
  estimatedMinutes: number;
  downloadedAt: string;
  signedInWhenDownloaded: boolean;
  lesson: PublicLesson;
}>;

export async function saveOfflineLesson(lesson: PublicLesson, signedIn: boolean): Promise<OfflineLessonRecord> {
  const record: OfflineLessonRecord = {
    id: lesson.id,
    slug: lesson.slug,
    route: `/learn/de/${lesson.levelCode.toLowerCase()}/${lesson.slug}`,
    title: lesson.title,
    summary: lesson.summary,
    languageCode: "de",
    levelCode: lesson.levelCode,
    revision: lesson.revision,
    estimatedMinutes: lesson.estimatedMinutes,
    downloadedAt: new Date().toISOString(),
    signedInWhenDownloaded: signedIn,
    lesson,
  };
  await putRecord(LESSON_STORE, record);
  notifyOfflineStateChanged();
  return record;
}

export async function listOfflineLessons(): Promise<OfflineLessonRecord[]> {
  const records = await getAllRecords<OfflineLessonRecord>(LESSON_STORE);
  return records.sort((left, right) => right.downloadedAt.localeCompare(left.downloadedAt));
}

export async function getOfflineLesson(slug: string, levelCode?: GermanLevel): Promise<OfflineLessonRecord | null> {
  const records = await listOfflineLessons();
  return records.find((record) => record.slug === slug && (!levelCode || record.levelCode === levelCode)) ?? null;
}

export async function removeOfflineLesson(id: string): Promise<void> {
  const database = await openDatabase();
  await transactionDone(database.transaction(LESSON_STORE, "readwrite"), (transaction) => transaction.objectStore(LESSON_STORE).delete(id));
  notifyOfflineStateChanged();
}

export async function queueOfflineMutation(operation: OfflineMutation): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(MUTATION_STORE, "readwrite");
    const store = transaction.objectStore(MUTATION_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const merged = mergeOfflineMutation(request.result as OfflineMutation[], operation);
      store.clear();
      for (const item of merged) store.put(item);
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Offline change could not be queued."));
    transaction.onabort = () => reject(transaction.error ?? request.error ?? new Error("Offline change could not be queued."));
  });
  notifyOfflineStateChanged();
}

export async function listOfflineMutations(): Promise<OfflineMutation[]> {
  const records = await getAllRecords<OfflineMutation>(MUTATION_STORE);
  return records.sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id));
}

export async function updateOfflineMutation(operation: OfflineMutation): Promise<void> {
  await putRecord(MUTATION_STORE, operation);
  notifyOfflineStateChanged();
}

export async function removeOfflineMutation(id: string): Promise<void> {
  const database = await openDatabase();
  await transactionDone(database.transaction(MUTATION_STORE, "readwrite"), (transaction) => transaction.objectStore(MUTATION_STORE).delete(id));
  notifyOfflineStateChanged();
}

async function putRecord(storeName: string, value: unknown): Promise<void> {
  const database = await openDatabase();
  await transactionDone(database.transaction(storeName, "readwrite"), (transaction) => transaction.objectStore(storeName).put(value));
}

async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const database = await openDatabase();
  return new Promise<T[]>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error ?? new Error("Offline storage could not be read."));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") throw new Error("Offline storage is not supported in this browser.");
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(LESSON_STORE)) database.createObjectStore(LESSON_STORE, { keyPath: "id" });
      if (!database.objectStoreNames.contains(MUTATION_STORE)) database.createObjectStore(MUTATION_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Offline storage could not be opened."));
  });
}

function transactionDone(transaction: IDBTransaction, action?: (transaction: IDBTransaction) => IDBRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Offline storage could not be updated."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Offline storage update was cancelled."));
    action?.(transaction);
  });
}

function notifyOfflineStateChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("language-guide-offline-change"));
}
