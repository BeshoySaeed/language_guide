import { and, eq, isNull } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { languageLevels, languages, levels, reviewItems, savedItems, users } from "@/db/schema";
import { getLessonById, getVocabularyById } from "@/infrastructure/catalog/lesson-content";
import { apiError, validationError } from "@/lib/api-response";
import { saveVocabularySchema } from "@/packages/contracts/src/library";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to view saved vocabulary.", 401);

  const lessonId = new URL(request.url).searchParams.get("lessonId");

  try {
    const db = getDb();
    const filters = [eq(savedItems.userId, user.userId), isNull(savedItems.deletedAt)];
    if (lessonId) filters.push(eq(savedItems.sourceLessonId, lessonId));

    const rows = await db
      .select({ saved: savedItems, review: reviewItems })
      .from(savedItems)
      .leftJoin(reviewItems, eq(reviewItems.savedItemId, savedItems.id))
      .where(and(...filters));

    const data = rows.flatMap(({ saved, review }) => {
      const catalogItem = getVocabularyById(saved.contentItemId);
      if (!catalogItem) return [];
      return [{
        id: saved.id,
        contentItemId: saved.contentItemId,
        sourceLessonId: saved.sourceLessonId,
        savedAt: saved.createdAt,
        vocabulary: catalogItem.vocabulary,
        lesson: { id: catalogItem.lesson.id, slug: catalogItem.lesson.slug, title: catalogItem.lesson.title, levelCode: catalogItem.levelCode },
        review: review ? { id: review.id, state: review.state, dueAt: review.dueAt, intervalDays: review.intervalDays } : null,
      }];
    });

    return Response.json({ data });
  } catch (error) {
    console.error("Failed to load saved vocabulary", error);
    return apiError("STORAGE_UNAVAILABLE", "Saved vocabulary is temporarily unavailable.", 503);
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to save vocabulary.", 401);

  const parsed = saveVocabularySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const catalogItem = getVocabularyById(parsed.data.contentItemId);
  const lesson = getLessonById(parsed.data.sourceLessonId);
  if (!catalogItem || !lesson || catalogItem.lesson.id !== lesson.id) {
    return apiError("VOCABULARY_NOT_FOUND", "That vocabulary item is not available in this lesson.", 404);
  }

  const now = new Date().toISOString();
  const savedItemId = `${user.userId}:${parsed.data.contentItemId}`;
  const reviewItemId = `review:${user.userId}:${parsed.data.contentItemId}`;

  try {
    const db = getDb();
    const [existing] = await db.select({ deletedAt: savedItems.deletedAt }).from(savedItems).where(and(
      eq(savedItems.userId, user.userId),
      eq(savedItems.contentItemId, parsed.data.contentItemId),
    )).limit(1);

    const reviewUpdate = existing?.deletedAt
      ? { suspended: false, dueAt: now, updatedAt: now }
      : { suspended: false, updatedAt: now };

    await db.batch([
      db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now }).onConflictDoUpdate({
        target: users.id,
        set: { email: user.email, displayName: user.displayName, updatedAt: now },
      }),
      db.insert(languages).values({ code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", updatedAt: now }).onConflictDoNothing(),
      db.insert(levels).values({ code: catalogItem.levelCode, rank: { A1: 1, A2: 2, B1: 3 }[catalogItem.levelCode] }).onConflictDoNothing(),
      db.insert(languageLevels).values({ languageCode: catalogItem.languageCode, levelCode: catalogItem.levelCode }).onConflictDoNothing(),
      db.insert(savedItems).values({
        id: savedItemId,
        userId: user.userId,
        contentItemId: parsed.data.contentItemId,
        contentType: "vocabulary",
        languageCode: catalogItem.languageCode,
        levelCode: catalogItem.levelCode,
        sourceLessonId: parsed.data.sourceLessonId,
        difficult: parsed.data.difficult,
        deletedAt: null,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [savedItems.userId, savedItems.contentItemId],
        set: { sourceLessonId: parsed.data.sourceLessonId, difficult: parsed.data.difficult, deletedAt: null, updatedAt: now },
      }),
      db.insert(reviewItems).values({
        id: reviewItemId,
        userId: user.userId,
        savedItemId,
        contentItemId: parsed.data.contentItemId,
        dueAt: now,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: [reviewItems.userId, reviewItems.contentItemId],
        set: reviewUpdate,
      }),
    ]);

    return Response.json({ data: { id: savedItemId, contentItemId: parsed.data.contentItemId, reviewItemId, dueAt: now } }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Failed to save vocabulary", error);
    return apiError("STORAGE_UNAVAILABLE", "This vocabulary item could not be saved.", 503);
  }
}
