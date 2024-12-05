CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Unnamed',
	`created_at` integer,
	`is_bookmark` integer,
	`parent_id` text,
	`updated_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `folder_name_idx` ON `folders` (`name`);--> statement-breakpoint
CREATE INDEX `folder_parent_idx` ON `folders` (`parent_id`);--> statement-breakpoint
CREATE INDEX `folder_bookmark_idx` ON `folders` (`is_bookmark`);--> statement-breakpoint
CREATE INDEX `folder_created_at_idx` ON `folders` (`created_at`);--> statement-breakpoint
CREATE TABLE `snippets` (
	`_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`lang` text,
	`keyword` text DEFAULT '',
	`content` text DEFAULT '',
	`name` text DEFAULT 'unnamed.txt',
	`tags` text,
	`placeholders` text DEFAULT (json_array()) NOT NULL,
	`created_at` integer,
	`check_placeholder` integer,
	`is_bookmark` integer,
	`folder_id` text,
	`updated_at` integer,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `snippets_id_unique` ON `snippets` (`id`);--> statement-breakpoint
CREATE INDEX `snippet_name_idx` ON `snippets` (`name`);--> statement-breakpoint
CREATE INDEX `snippet_tags_idx` ON `snippets` (`tags`);--> statement-breakpoint
CREATE INDEX `snippet_folder_idx` ON `snippets` (`folder_id`);--> statement-breakpoint
CREATE INDEX `snippet_bookmark_idx` ON `snippets` (`is_bookmark`);--> statement-breakpoint
CREATE INDEX `snippet_created_at_idx` ON `snippets` (`created_at`);