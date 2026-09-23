import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  status: text("status", { enum: ["active", "suspended", "deleted"] }).notNull().default("active"),
  ...timestamps,
}, (table) => [uniqueIndex("idx_users_email").on(table.email)]);

export const authCredentials = sqliteTable("auth_credentials", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  passwordIterations: integer("password_iterations").notNull(),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  passwordChangedAt: text("password_changed_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  ...timestamps,
});

export const authSessions = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  ...timestamps,
}, (table) => [
  index("idx_auth_sessions_user").on(table.userId, table.expiresAt),
  index("idx_auth_sessions_expiry").on(table.expiresAt),
]);

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  uiLocale: text("ui_locale").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  theme: text("theme", { enum: ["light", "dark", "system"] }).notNull().default("system"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(20),
  version: integer("version").notNull().default(1),
  ...timestamps,
});

export const languages = sqliteTable("languages", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  nativeName: text("native_name").notNull(),
  direction: text("direction", { enum: ["ltr", "rtl"] }).notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("published"),
  ...timestamps,
});

export const levels = sqliteTable("levels", {
  code: text("code").primaryKey(),
  framework: text("framework").notNull().default("CEFR"),
  rank: integer("rank").notNull(),
});

export const languageLevels = sqliteTable("language_levels", {
  languageCode: text("language_code").notNull().references(() => languages.code, { onDelete: "cascade" }),
  levelCode: text("level_code").notNull().references(() => levels.code, { onDelete: "cascade" }),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("published"),
}, (table) => [primaryKey({ columns: [table.languageCode, table.levelCode] })]);

export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  languageCode: text("language_code").notNull().references(() => languages.code),
  currentLevelCode: text("current_level_code").notNull().references(() => levels.code),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_enrollments_user_language").on(table.userId, table.languageCode),
  index("idx_enrollments_user_active").on(table.userId, table.active),
]);

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  languageCode: text("language_code").notNull().references(() => languages.code),
  levelCode: text("level_code").notNull().references(() => levels.code),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status", { enum: ["draft", "in_review", "reviewed", "published", "archived"] }).notNull().default("draft"),
  revision: integer("revision").notNull().default(1),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_books_language_level_slug").on(table.languageCode, table.levelCode, table.slug),
  index("idx_books_catalog").on(table.languageCode, table.levelCode, table.status, table.sortOrder),
]);

export const chapters = sqliteTable("chapters", {
  id: text("id").primaryKey(),
  bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  ...timestamps,
}, (table) => [uniqueIndex("idx_chapters_book_slug").on(table.bookId, table.slug)]);

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  chapterId: text("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  estimatedMinutes: integer("estimated_minutes").notNull().default(10),
  sortOrder: integer("sort_order").notNull(),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  revision: integer("revision").notNull().default(1),
  ...timestamps,
}, (table) => [uniqueIndex("idx_lessons_chapter_slug").on(table.chapterId, table.slug)]);

export const contentItems = sqliteTable("content_items", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["vocabulary", "sentence", "grammar", "reading", "exercise", "quiz"] }).notNull(),
  languageCode: text("language_code").notNull().references(() => languages.code),
  levelCode: text("level_code").notNull().references(() => levels.code),
  status: text("status", { enum: ["draft", "in_review", "reviewed", "published", "archived"] }).notNull().default("draft"),
  revision: integer("revision").notNull().default(1),
  payload: text("payload", { mode: "json" }).notNull().$type<Record<string, unknown>>(),
  ...timestamps,
}, (table) => [index("idx_content_catalog").on(table.languageCode, table.levelCode, table.type, table.status)]);

export const lessonContent = sqliteTable("lesson_content", {
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  contentItemId: text("content_item_id").notNull().references(() => contentItems.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  sortOrder: integer("sort_order").notNull(),
  required: integer("required", { mode: "boolean" }).notNull().default(true),
}, (table) => [primaryKey({ columns: [table.lessonId, table.contentItemId] })]);

export const learningEvents = sqliteTable("learning_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: text("device_id"),
  type: text("type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: text("payload", { mode: "json" }).notNull().$type<Record<string, unknown>>(),
  occurredAt: text("occurred_at").notNull(),
  receivedAt: text("received_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  clientOperationId: text("client_operation_id").notNull(),
}, (table) => [
  uniqueIndex("idx_learning_events_user_operation").on(table.userId, table.clientOperationId),
  index("idx_learning_events_user_received").on(table.userId, table.receivedAt),
]);

export const lessonProgress = sqliteTable("lesson_progress", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  state: text("state", { enum: ["not_started", "in_progress", "completed"] }).notNull().default("not_started"),
  percent: integer("percent").notNull().default(0),
  bestScore: integer("best_score").notNull().default(0),
  attemptsCount: integer("attempts_count").notNull().default(0),
  completedAt: text("completed_at"),
  version: integer("version").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.lessonId] }),
  index("idx_lesson_progress_user_state").on(table.userId, table.state, table.updatedAt),
]);

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assessmentType: text("assessment_type", { enum: ["practice", "quiz"] }).notNull(),
  assessmentId: text("assessment_id").notNull(),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  contentRevision: integer("content_revision").notNull(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  clientOperationId: text("client_operation_id").notNull(),
}, (table) => [
  uniqueIndex("idx_attempts_user_operation").on(table.userId, table.clientOperationId),
  index("idx_attempts_user_lesson").on(table.userId, table.lessonId, table.completedAt),
]);

export const attemptAnswers = sqliteTable("attempt_answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id").notNull().references(() => attempts.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull(),
  promptSnapshot: text("prompt_snapshot").notNull(),
  response: text("response").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  score: integer("score").notNull(),
  feedbackCode: text("feedback_code").notNull(),
  answeredAt: text("answered_at").notNull(),
}, (table) => [index("idx_attempt_answers_attempt").on(table.attemptId)]);

export const challengeAttempts = sqliteTable("challenge_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: text("challenge_id").notNull(),
  seed: text("seed").notNull(),
  languageCode: text("language_code").notNull(),
  levelCode: text("level_code").notNull(),
  mode: text("mode", { enum: ["mixed", "speed", "level_test"] }).notNull().default("mixed"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at").notNull(),
  durationMs: integer("duration_ms").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  clientOperationId: text("client_operation_id").notNull(),
}, (table) => [
  uniqueIndex("idx_challenge_attempts_user_operation").on(table.userId, table.clientOperationId),
  index("idx_challenge_attempts_user_completed").on(table.userId, table.completedAt),
]);

export const levelAssessmentResults = sqliteTable("level_assessment_results", {
  attemptId: text("attempt_id").primaryKey().references(() => challengeAttempts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  languageCode: text("language_code").notNull(),
  levelCode: text("level_code").notNull(),
  overallPercent: integer("overall_percent").notNull(),
  skills: text("skills", { mode: "json" }).notNull().$type<readonly { skill: string; correct: number; total: number; percent: number }[]>(),
  weakSkills: text("weak_skills", { mode: "json" }).notNull().$type<readonly string[]>(),
  recommendedLessons: text("recommended_lessons", { mode: "json" }).notNull().$type<readonly string[]>(),
  passed: integer("passed", { mode: "boolean" }).notNull(),
  completedAt: text("completed_at").notNull(),
}, (table) => [index("idx_level_assessment_results_user_level").on(table.userId, table.levelCode, table.completedAt)]);

export const savedItems = sqliteTable("saved_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentItemId: text("content_item_id").notNull(),
  contentType: text("content_type", { enum: ["vocabulary", "sentence", "grammar"] }).notNull(),
  languageCode: text("language_code").notNull(),
  levelCode: text("level_code").notNull(),
  sourceLessonId: text("source_lesson_id").notNull(),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(true),
  difficult: integer("difficult", { mode: "boolean" }).notNull().default(false),
  deletedAt: text("deleted_at"),
  version: integer("version").notNull().default(1),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_saved_items_user_content").on(table.userId, table.contentItemId),
  index("idx_saved_items_user_active").on(table.userId, table.deletedAt, table.updatedAt),
]);

export const reviewItems = sqliteTable("review_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  savedItemId: text("saved_item_id").notNull().references(() => savedItems.id, { onDelete: "cascade" }),
  contentItemId: text("content_item_id").notNull(),
  state: text("state", { enum: ["new", "learning", "review", "mastered"] }).notNull().default("new"),
  dueAt: text("due_at").notNull(),
  intervalDays: integer("interval_days").notNull().default(0),
  easeFactor: integer("ease_factor").notNull().default(250),
  repetitionCount: integer("repetition_count").notNull().default(0),
  lapseCount: integer("lapse_count").notNull().default(0),
  suspended: integer("suspended", { mode: "boolean" }).notNull().default(false),
  scheduler: text("scheduler").notNull().default("language-guide"),
  schedulerVersion: integer("scheduler_version").notNull().default(1),
  version: integer("version").notNull().default(1),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_review_items_user_content").on(table.userId, table.contentItemId),
  index("idx_review_items_user_due").on(table.userId, table.suspended, table.dueAt),
]);

export const reviewEvents = sqliteTable("review_events", {
  id: text("id").primaryKey(),
  reviewItemId: text("review_item_id").notNull().references(() => reviewItems.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: text("rating", { enum: ["again", "hard", "good", "easy"] }).notNull(),
  previousState: text("previous_state", { enum: ["new", "learning", "review", "mastered"] }).notNull(),
  nextState: text("next_state", { enum: ["new", "learning", "review", "mastered"] }).notNull(),
  previousIntervalDays: integer("previous_interval_days").notNull(),
  nextIntervalDays: integer("next_interval_days").notNull(),
  scheduledFor: text("scheduled_for").notNull(),
  reviewedAt: text("reviewed_at").notNull(),
  clientOperationId: text("client_operation_id").notNull(),
}, (table) => [
  uniqueIndex("idx_review_events_user_operation").on(table.userId, table.clientOperationId),
  index("idx_review_events_item_reviewed").on(table.reviewItemId, table.reviewedAt),
]);
