import { and, asc, eq, isNull, lte, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { reviewItems, savedItems } from "@/db/schema";
import { getVocabularyById } from "@/infrastructure/catalog/lesson-content";

export type SavedVocabularyView = {
  contentItemId: string;
  savedAt: string;
  vocabulary: { id: string; lemma: string; translation: string; pronunciation: string; partOfSpeech: string };
  lesson: { id: string; slug: string; title: string; levelCode: "A1" | "A2" | "B1" };
  review: { id: string; state: "new" | "learning" | "review" | "mastered"; dueAt: string; intervalDays: number } | null;
};

export type DueReviewView = {
  reviewItemId: string;
  contentItemId: string;
  state: "new" | "learning" | "review" | "mastered";
  dueAt: string;
  intervalDays: number;
  vocabulary: SavedVocabularyView["vocabulary"];
  lesson: SavedVocabularyView["lesson"];
};

export async function loadSavedVocabulary(userId: string): Promise<SavedVocabularyView[]> {
  const rows = await getDb().select({ saved: savedItems, review: reviewItems }).from(savedItems)
    .leftJoin(reviewItems, eq(reviewItems.savedItemId, savedItems.id))
    .where(and(eq(savedItems.userId, userId), isNull(savedItems.deletedAt)))
    .orderBy(asc(savedItems.createdAt));

  return rows.flatMap(({ saved, review }) => {
    const item = getVocabularyById(saved.contentItemId);
    if (!item) return [];
    return [{
      contentItemId: saved.contentItemId,
      savedAt: saved.createdAt,
      vocabulary: pickVocabulary(item.vocabulary),
      lesson: { id: item.lesson.id, slug: item.lesson.slug, title: item.lesson.title, levelCode: item.levelCode },
      review: review ? { id: review.id, state: review.state, dueAt: review.dueAt, intervalDays: review.intervalDays } : null,
    }];
  });
}

export async function loadDueReviews(userId: string, now = new Date()): Promise<DueReviewView[]> {
  const rows = await getDb().select({ review: reviewItems }).from(reviewItems)
    .innerJoin(savedItems, eq(savedItems.id, reviewItems.savedItemId))
    .where(and(eq(reviewItems.userId, userId), eq(reviewItems.suspended, false), isNull(savedItems.deletedAt), lte(reviewItems.dueAt, now.toISOString())))
    .orderBy(asc(reviewItems.dueAt));

  return rows.flatMap(({ review }) => {
    const item = getVocabularyById(review.contentItemId);
    if (!item) return [];
    return [{
      reviewItemId: review.id,
      contentItemId: review.contentItemId,
      state: review.state,
      dueAt: review.dueAt,
      intervalDays: review.intervalDays,
      vocabulary: pickVocabulary(item.vocabulary),
      lesson: { id: item.lesson.id, slug: item.lesson.slug, title: item.lesson.title, levelCode: item.levelCode },
    }];
  });
}

export async function countDueReviews(userId: string, now = new Date()): Promise<number> {
  const [result] = await getDb().select({ count: sql<number>`count(*)` }).from(reviewItems)
    .innerJoin(savedItems, eq(savedItems.id, reviewItems.savedItemId))
    .where(and(eq(reviewItems.userId, userId), eq(reviewItems.suspended, false), isNull(savedItems.deletedAt), lte(reviewItems.dueAt, now.toISOString())));
  return Number(result?.count ?? 0);
}

function pickVocabulary(vocabulary: { id: string; lemma: string; translation: string; pronunciation: string; partOfSpeech: string }) {
  return { id: vocabulary.id, lemma: vocabulary.lemma, translation: vocabulary.translation, pronunciation: vocabulary.pronunciation, partOfSpeech: vocabulary.partOfSpeech };
}
