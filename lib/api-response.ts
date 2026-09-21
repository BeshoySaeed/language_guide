import type { ZodError } from "zod";

export function apiError(code: string, message: string, status: number, requestId = crypto.randomUUID()) {
  return Response.json({ error: { code, message, requestId } }, { status, headers: { "x-request-id": requestId } });
}

export function validationError(error: ZodError, requestId = crypto.randomUUID()) {
  return Response.json(
    { error: { code: "VALIDATION_ERROR", message: "The request contains invalid fields.", issues: error.flatten().fieldErrors, requestId } },
    { status: 400, headers: { "x-request-id": requestId } },
  );
}

