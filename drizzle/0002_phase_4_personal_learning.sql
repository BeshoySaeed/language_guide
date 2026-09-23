CREATE TABLE `review_events` (
	`id` text PRIMARY KEY NOT NULL,
	`review_item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` text NOT NULL,
	`previous_state` text NOT NULL,
	`next_state` text NOT NULL,
	`previous_interval_days` integer NOT NULL,
	`next_interval_days` integer NOT NULL,
	`scheduled_for` text NOT NULL,
	`reviewed_at` text NOT NULL,
	`client_operation_id` text NOT NULL,
	FOREIGN KEY (`review_item_id`) REFERENCES `review_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_review_events_user_operation` ON `review_events` (`user_id`,`client_operation_id`);--> statement-breakpoint
CREATE INDEX `idx_review_events_item_reviewed` ON `review_events` (`review_item_id`,`reviewed_at`);--> statement-breakpoint
CREATE TABLE `review_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`saved_item_id` text NOT NULL,
	`content_item_id` text NOT NULL,
	`state` text DEFAULT 'new' NOT NULL,
	`due_at` text NOT NULL,
	`interval_days` integer DEFAULT 0 NOT NULL,
	`ease_factor` integer DEFAULT 250 NOT NULL,
	`repetition_count` integer DEFAULT 0 NOT NULL,
	`lapse_count` integer DEFAULT 0 NOT NULL,
	`suspended` integer DEFAULT false NOT NULL,
	`scheduler` text DEFAULT 'language-guide' NOT NULL,
	`scheduler_version` integer DEFAULT 1 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`saved_item_id`) REFERENCES `saved_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_review_items_user_content` ON `review_items` (`user_id`,`content_item_id`);--> statement-breakpoint
CREATE INDEX `idx_review_items_user_due` ON `review_items` (`user_id`,`suspended`,`due_at`);--> statement-breakpoint
CREATE TABLE `saved_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content_item_id` text NOT NULL,
	`content_type` text NOT NULL,
	`language_code` text NOT NULL,
	`level_code` text NOT NULL,
	`source_lesson_id` text NOT NULL,
	`favorite` integer DEFAULT true NOT NULL,
	`difficult` integer DEFAULT false NOT NULL,
	`deleted_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_saved_items_user_content` ON `saved_items` (`user_id`,`content_item_id`);--> statement-breakpoint
CREATE INDEX `idx_saved_items_user_active` ON `saved_items` (`user_id`,`deleted_at`,`updated_at`);