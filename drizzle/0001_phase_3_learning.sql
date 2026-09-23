CREATE TABLE `attempt_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`prompt_snapshot` text NOT NULL,
	`response` text NOT NULL,
	`correct` integer NOT NULL,
	`score` integer NOT NULL,
	`feedback_code` text NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_attempt_answers_attempt` ON `attempt_answers` (`attempt_id`);--> statement-breakpoint
CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`assessment_type` text NOT NULL,
	`assessment_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`content_revision` integer NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text NOT NULL,
	`score` integer NOT NULL,
	`max_score` integer NOT NULL,
	`passed` integer NOT NULL,
	`client_operation_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attempts_user_operation` ON `attempts` (`user_id`,`client_operation_id`);--> statement-breakpoint
CREATE INDEX `idx_attempts_user_lesson` ON `attempts` (`user_id`,`lesson_id`,`completed_at`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`state` text DEFAULT 'not_started' NOT NULL,
	`percent` integer DEFAULT 0 NOT NULL,
	`best_score` integer DEFAULT 0 NOT NULL,
	`attempts_count` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lesson_progress_user_state` ON `lesson_progress` (`user_id`,`state`,`updated_at`);