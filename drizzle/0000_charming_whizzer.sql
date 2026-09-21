CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`language_code` text NOT NULL,
	`level_code` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`level_code`) REFERENCES `levels`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_books_language_level_slug` ON `books` (`language_code`,`level_code`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_books_catalog` ON `books` (`language_code`,`level_code`,`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`book_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_chapters_book_slug` ON `chapters` (`book_id`,`slug`);--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`language_code` text NOT NULL,
	`level_code` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`payload` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`level_code`) REFERENCES `levels`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_content_catalog` ON `content_items` (`language_code`,`level_code`,`type`,`status`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`language_code` text NOT NULL,
	`current_level_code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_level_code`) REFERENCES `levels`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_enrollments_user_language` ON `enrollments` (`user_id`,`language_code`);--> statement-breakpoint
CREATE INDEX `idx_enrollments_user_active` ON `enrollments` (`user_id`,`active`);--> statement-breakpoint
CREATE TABLE `language_levels` (
	`language_code` text NOT NULL,
	`level_code` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	PRIMARY KEY(`language_code`, `level_code`),
	FOREIGN KEY (`language_code`) REFERENCES `languages`(`code`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`level_code`) REFERENCES `levels`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`native_name` text NOT NULL,
	`direction` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text,
	`type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`payload` text NOT NULL,
	`occurred_at` text NOT NULL,
	`received_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`client_operation_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_learning_events_user_operation` ON `learning_events` (`user_id`,`client_operation_id`);--> statement-breakpoint
CREATE INDEX `idx_learning_events_user_received` ON `learning_events` (`user_id`,`received_at`);--> statement-breakpoint
CREATE TABLE `lesson_content` (
	`lesson_id` text NOT NULL,
	`content_item_id` text NOT NULL,
	`section` text NOT NULL,
	`sort_order` integer NOT NULL,
	`required` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`lesson_id`, `content_item_id`),
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`content_item_id`) REFERENCES `content_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`estimated_minutes` integer DEFAULT 10 NOT NULL,
	`sort_order` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_lessons_chapter_slug` ON `lessons` (`chapter_id`,`slug`);--> statement-breakpoint
CREATE TABLE `levels` (
	`code` text PRIMARY KEY NOT NULL,
	`framework` text DEFAULT 'CEFR' NOT NULL,
	`rank` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`ui_locale` text DEFAULT 'en' NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`daily_goal_minutes` integer DEFAULT 20 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);