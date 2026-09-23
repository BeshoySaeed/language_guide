import { and, eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { reviewItems, savedItems } from "@/db/schema";
import { getVocabularyById } from "@/infrastructure/catalog/lesson-content";
import { apiError } from "@/lib/api-response";

export async function DELETE(_request: Request, context: { params: Promise<{ contentItemId: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to update saved vocabulary.", 401);

  const { contentItemId } = await context.params;
  if (!getVocabularyById(contentItemId)) return apiError("VOCABULARY_NOT_FOUND", "That vocabulary item is not available.", 404);

  try {
    const db = getDb();
    const [existing] = await db.select({ id: savedItems.id }).from(savedItems).where(and(
      eq(savedItems.userId, user.userId),
      eq(savedItems.contentItemId, contentItemId),
    )).limit(1);
    if (!existing) return apiError("SAVED_ITEM_NOT_FOUND", "That vocabulary item is not in your library.", 404);

    const now = new Date().toISOString();
    await db.batch([
      db.update(savedItems).set({ deletedAt: now, updatedAt: now }).where(and(
        eq(savedItems.userId, user.userId),
        eq(savedItems.contentItemId, contentItemId),
      )),
      db.update(reviewItems).set({ suspended: true, updatedAt: now }).where(and(
        eq(reviewItems.userId, user.userId),
        eq(reviewItems.contentItemId, contentItemId),
      )),
    ]);

    return Response.json({ data: { contentItemId, deletedAt: now } });
  } catch (error) {
    console.error("Failed to remove saved vocabulary", error);
    return apiError("STORAGE_UNAVAILABLE", "This vocabulary item could not be removed.", 503);
  }
}
