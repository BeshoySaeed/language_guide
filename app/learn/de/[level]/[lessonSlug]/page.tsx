import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { LessonPlayer } from "@/components/learn/lesson-player";
import { getDb } from "@/db";
import { lessonProgress } from "@/db/schema";
import { getPublicLessonBySlug, isGermanLevel, listPublicLessons } from "@/infrastructure/catalog/lesson-content";
import { calculateLessonAccess } from "@/packages/domain/src/curriculum-progression";

export const dynamic = "force-dynamic";

export default async function GermanLessonPage({ params }: { params: Promise<{ level: string; lessonSlug: string }> }) {
  const { level, lessonSlug } = await params;
  const normalizedLevel = level.toUpperCase();
  if (!isGermanLevel(normalizedLevel)) notFound();
  const lesson = getPublicLessonBySlug(normalizedLevel, lessonSlug);
  if (!lesson) notFound();
  const user = await getChatGPTUser();
  if (user && await lessonIsLocked(user.userId, normalizedLevel, lesson.id)) {
    redirect(`/learn?level=${normalizedLevel}&locked=${encodeURIComponent(lesson.slug)}`);
  }
  const returnTo = `/learn/de/${normalizedLevel.toLowerCase()}/${lesson.slug}`;
  return <LessonPlayer lesson={lesson} signedIn={Boolean(user)} signInPath={chatGPTSignInPath(returnTo)} />;
}

async function lessonIsLocked(userId: string, level: Parameters<typeof listPublicLessons>[0], lessonId: string) {
  try {
    const lessons = listPublicLessons(level);
    const progress = await getDb().select().from(lessonProgress).where(eq(lessonProgress.userId, userId));
    return calculateLessonAccess(lessons.map((lesson) => lesson.id), progress, true).find((item) => item.lessonId === lessonId)?.unlocked === false;
  } catch (error) {
    console.error("Failed to enforce lesson prerequisites", error);
    return false;
  }
}
