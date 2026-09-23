export type OfflineMutationKind = "assessment_attempt" | "saved_item";
export type OfflineMutationStatus = "pending" | "syncing" | "failed";

export type OfflineMutation = Readonly<{
  id: string;
  kind: OfflineMutationKind;
  entityKey: string;
  method: "POST" | "DELETE";
  url: string;
  body: unknown;
  createdAt: string;
  status: OfflineMutationStatus;
  failureMessage?: string;
}>;

export type SyncDisposition = "applied" | "retry" | "blocked" | "rejected";

export function mergeOfflineMutation(
  current: readonly OfflineMutation[],
  incoming: OfflineMutation,
): OfflineMutation[] {
  const withoutConflict = incoming.kind === "saved_item"
    ? current.filter((operation) => !(operation.kind === "saved_item" && operation.entityKey === incoming.entityKey))
    : current.filter((operation) => operation.id !== incoming.id);

  return [...withoutConflict, incoming].sort(compareOperations);
}

export function classifySyncResponse(status: number): SyncDisposition {
  if (status >= 200 && status < 300) return "applied";
  if (status === 401 || status === 403) return "blocked";
  if (status >= 400 && status < 500) return "rejected";
  return "retry";
}

function compareOperations(left: OfflineMutation, right: OfflineMutation): number {
  const byTime = left.createdAt.localeCompare(right.createdAt);
  return byTime || left.id.localeCompare(right.id);
}
