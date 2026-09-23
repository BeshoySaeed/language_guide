CREATE TABLE `challenge_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`challenge_id` text NOT NULL,
	`seed` text NOT NULL,
	`language_code` text NOT NULL,
	`level_code` text NOT NULL,
	`mode` text DEFAULT 'mixed' NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text NOT NULL,
	`duration_ms` integer NOT NULL,
	`score` integer NOT NULL,
	`max_score` integer NOT NULL,
	`passed` integer NOT NULL,
	`client_operation_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_challenge_attempts_user_operation` ON `challenge_attempts` (`user_id`,`client_operation_id`);--> statement-breakpoint
CREATE INDEX `idx_challenge_attempts_user_completed` ON `challenge_attempts` (`user_id`,`completed_at`);