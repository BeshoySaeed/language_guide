"use client";

import {
  listOfflineMutations,
  queueOfflineMutation,
  removeOfflineMutation,
  updateOfflineMutation,
} from "@/lib/offline-db";
import {
  classifySyncResponse,
  type OfflineMutation,
  type OfflineMutationKind,
} from "@/packages/domain/src/offline-sync";

export type OfflineRequest = Readonly<{
  kind: OfflineMutationKind;
  entityKey: string;
  method: "POST" | "DELETE";
  url: string;
  body?: unknown;
  operationId?: string;
}>;

export type OfflineRequestResult =
  | { state: "sent"; operationId: string; body: unknown }
  | { state: "queued"; operationId: string };

let flushPromise: Promise<number> | null = null;

export async function submitWithOfflineFallback(request: OfflineRequest): Promise<OfflineRequestResult> {
  const operation: OfflineMutation = {
    id: request.operationId ?? crypto.randomUUID(),
    kind: request.kind,
    entityKey: request.entityKey,
    method: request.method,
    url: request.url,
    body: request.body ?? null,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await queueOfflineMutation(operation);

  if (!navigator.onLine) return { state: "queued", operationId: operation.id };
  try {
    const response = await sendOperation(operation);
    const disposition = classifySyncResponse(response.status);
    const body = await readResponseBody(response);
    if (disposition === "applied") {
      await removeOfflineMutation(operation.id);
      return { state: "sent", operationId: operation.id, body };
    }
    if (disposition === "retry") return { state: "queued", operationId: operation.id };
    await removeOfflineMutation(operation.id);
    throw new Error(readErrorMessage(body) ?? "This offline change could not be accepted.");
  } catch (error) {
    if (error instanceof TypeError) return { state: "queued", operationId: operation.id };
    throw error;
  }
}

export async function flushOfflineQueue(): Promise<number> {
  if (flushPromise) return flushPromise;
  flushPromise = flushQueueNow().finally(() => { flushPromise = null; });
  return flushPromise;
}

async function flushQueueNow(): Promise<number> {
  if (!navigator.onLine) return 0;
  const operations = await listOfflineMutations();
  let applied = 0;
  for (const operation of operations) {
    await updateOfflineMutation({ ...operation, status: "syncing", failureMessage: undefined });
    try {
      const response = await sendOperation(operation);
      const body = await readResponseBody(response);
      const disposition = classifySyncResponse(response.status);
      if (disposition === "applied") {
        await removeOfflineMutation(operation.id);
        applied += 1;
        window.dispatchEvent(new CustomEvent("language-guide-sync-result", { detail: { operationId: operation.id, body } }));
        continue;
      }
      if (disposition === "retry") {
        await updateOfflineMutation({ ...operation, status: "pending", failureMessage: undefined });
        break;
      }
      await updateOfflineMutation({
        ...operation,
        status: "failed",
        failureMessage: readErrorMessage(body) ?? (disposition === "blocked" ? "Sign in again to sync this change." : "This change needs your attention."),
      });
    } catch {
      await updateOfflineMutation({ ...operation, status: "pending", failureMessage: undefined });
      break;
    }
  }
  return applied;
}

function sendOperation(operation: OfflineMutation): Promise<Response> {
  return fetch(operation.url, {
    method: operation.method,
    headers: operation.method === "POST" ? { "content-type": "application/json" } : undefined,
    body: operation.method === "POST" ? JSON.stringify(operation.body) : undefined,
  });
}

async function readResponseBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function readErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("error" in body)) return null;
  const error = body.error;
  if (!error || typeof error !== "object" || !("message" in error) || typeof error.message !== "string") return null;
  return error.message;
}
