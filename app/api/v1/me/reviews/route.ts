import { and, eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { reviewEvents, reviewItems } from "@/db/schema";
import { apiError, validationError } from "@/lib/api-response";
import { reviewRatingSchema } from "@/packages/contracts/src/library";
import { scheduleReview } from "@/packages/domain/src/review-scheduler";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to complete a review.", 401);

  const parsed = reviewRatingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const db = getDb();
    const [replayed] = await db.select().from(reviewEvents).where(and(
      eq(reviewEvents.userId, user.userId),
      eq(reviewEvents.clientOperationId, parsed.data.clientOperationId),
    )).limit(1);
    if (replayed) {
      const [current] = await db.select().from(reviewItems).where(eq(reviewItems.id, replayed.reviewItemId)).limit(1);
      return Response.json({ data: { reviewItemId: replayed.reviewItemId, state: replayed.nextState, dueAt: current?.dueAt, intervalDays: replayed.nextIntervalDays, replayed: true } });
    }

    const [review] = await db.select().from(reviewItems).where(and(
      eq(reviewItems.id, parsed.data.reviewItemId),
      eq(reviewItems.userId, user.userId),
    )).limit(1);
    if (!review || review.suspended) return apiError("REVIEW_NOT_FOUND", "That review item is no longer available.", 404);

    const reviewedAt = new Date();
    const next = scheduleReview({
      state: review.state,
      rating: parsed.data.rating,
      intervalDays: review.intervalDays,
      easeFactor: review.easeFactor,
      repetitionCount: review.repetitionCount,
      lapseCount: review.lapseCount,
      reviewedAt,
    });
    const reviewedAtIso = reviewedAt.toISOString();
    const dueAt = next.dueAt.toISOString();

    await db.batch([
      db.insert(reviewEvents).values({
        id: crypto.randomUUID(),
        reviewItemId: review.id,
        userId: user.userId,
        rating: parsed.data.rating,
        previousState: review.state,
        nextState: next.state,
        previousIntervalDays: review.intervalDays,
        nextIntervalDays: next.intervalDays,
        scheduledFor: review.dueAt,
        reviewedAt: reviewedAtIso,
        clientOperationId: parsed.data.clientOperationId,
      }),
      db.update(reviewItems).set({
        state: next.state,
        dueAt,
        intervalDays: next.intervalDays,
        easeFactor: next.easeFactor,
        repetitionCount: next.repetitionCount,
        lapseCount: next.lapseCount,
        version: review.version + 1,
        updatedAt: reviewedAtIso,
      }).where(and(eq(reviewItems.id, review.id), eq(reviewItems.userId, user.userId))),
    ]);

    return Response.json({ data: { reviewItemId: review.id, state: next.state, dueAt, intervalDays: next.intervalDays, replayed: false } });
  } catch (error) {
    console.error("Failed to schedule review", error);
    return apiError("STORAGE_UNAVAILABLE", "Your review could not be saved.", 503);
  }
}
