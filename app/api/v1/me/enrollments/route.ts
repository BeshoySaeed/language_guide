import { and, eq } from "drizzle-orm";

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { enrollments, languageLevels, languages, levels, users } from "@/db/schema";
import { languageRepository } from "@/infrastructure/catalog/configured-language-repository";
import { apiError, validationError } from "@/lib/api-response";
import { enrollmentInputSchema } from "@/packages/contracts/src/languages";
import { assertSupportedLevel, CEFR_LEVELS } from "@/packages/domain/src/language";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to view your learning languages.", 401);

  try {
    const data = await getDb().select().from(enrollments).where(eq(enrollments.userId, user.userId));
    return Response.json({ data });
  } catch (error) {
    console.error("Failed to load enrollments", error);
    return apiError("STORAGE_UNAVAILABLE", "Your learning languages are temporarily unavailable.", 503);
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return apiError("UNAUTHENTICATED", "Sign in to save a learning language.", 401);

  const parsed = enrollmentInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const language = await languageRepository.findByCode(parsed.data.languageCode);
  if (!language) return apiError("LANGUAGE_NOT_FOUND", "That language is not available.", 404);
  assertSupportedLevel(language, parsed.data.level);

  try {
    const db = getDb();
    const now = new Date().toISOString();
    const levelRank = CEFR_LEVELS.indexOf(parsed.data.level) + 1;
    const enrollmentId = `${user.userId}:${language.code}`;

    await db.batch([
      db.insert(users).values({ id: user.userId, email: user.email, displayName: user.displayName, updatedAt: now }).onConflictDoUpdate({ target: users.id, set: { email: user.email, displayName: user.displayName, updatedAt: now } }),
      db.insert(languages).values({ code: language.code, name: language.name, nativeName: language.nativeName, direction: language.direction, updatedAt: now }).onConflictDoUpdate({ target: languages.code, set: { name: language.name, nativeName: language.nativeName, direction: language.direction, updatedAt: now } }),
      db.insert(levels).values({ code: parsed.data.level, rank: levelRank }).onConflictDoNothing(),
      db.insert(languageLevels).values({ languageCode: language.code, levelCode: parsed.data.level }).onConflictDoNothing(),
      db.insert(enrollments).values({ id: enrollmentId, userId: user.userId, languageCode: language.code, currentLevelCode: parsed.data.level, updatedAt: now }).onConflictDoUpdate({ target: [enrollments.userId, enrollments.languageCode], set: { currentLevelCode: parsed.data.level, active: true, updatedAt: now } }),
    ]);

    const [saved] = await db.select().from(enrollments).where(and(eq(enrollments.userId, user.userId), eq(enrollments.languageCode, language.code))).limit(1);
    return Response.json({ data: saved }, { status: 201 });
  } catch (error) {
    console.error("Failed to save enrollment", error);
    return apiError("STORAGE_UNAVAILABLE", "Your selection could not be saved. Please try again.", 503);
  }
}

