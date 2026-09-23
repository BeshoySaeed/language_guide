import { and, eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { lessonProgress } from "@/db/schema";
import { getLessonById } from "@/infrastructure/catalog/lesson-content";
import { apiError } from "@/lib/api-response";

export async function GET(_request: Request, context: { params: Promise<{ lessonId: string }> }) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to view lesson progress.", 401);
  const { lessonId } = await context.params;
  if (!getLessonById(lessonId)) return apiError("LESSON_NOT_FOUND", "That lesson is not available.", 404);

  try {
    const [progress] = await getDb().select().from(lessonProgress).where(and(
      eq(lessonProgress.userId, user.userId),
      eq(lessonProgress.lessonId, lessonId),
    )).limit(1);
    return Response.json({ data: progress ?? { lessonId, state: "not_started", percent: 0, bestScore: 0, attemptsCount: 0 } });
  } catch (error) {
    console.error("Failed to load lesson progress", error);
    return apiError("STORAGE_UNAVAILABLE", "Lesson progress is temporarily unavailable.", 503);
  }
}
