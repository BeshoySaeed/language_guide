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

