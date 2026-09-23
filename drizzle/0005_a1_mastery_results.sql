CREATE TABLE `level_assessment_results` (
	`attempt_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`language_code` text NOT NULL,
	`level_code` text NOT NULL,
	`overall_percent` integer NOT NULL,
	`skills` text NOT NULL,
	`weak_skills` text NOT NULL,
	`recommended_lessons` text NOT NULL,
	`passed` integer NOT NULL,
	`completed_at` text NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `challenge_attempts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_level_assessment_results_user_level` ON `level_assessment_results` (`user_id`,`level_code`,`completed_at`);
