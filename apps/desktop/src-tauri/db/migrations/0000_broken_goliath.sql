CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Unnamed',
	`created_at` integer,
	`parent_id` text,
	`updated_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `folder_name_idx` ON `folders` (`name`);--> statement-breakpoint
CREATE INDEX `folder_parent_idx` ON `folders` (`parent_id`);--> statement-breakpoint
CREATE INDEX `folder_created_at_idx` ON `folders` (`created_at`);--> statement-breakpoint
CREATE TABLE `snippets` (
	`id` text PRIMARY KEY NOT NULL,
	`ext` text DEFAULT 'txt',
	`content` text DEFAULT '',
	`name` text DEFAULT 'Unnamed',
	`tags` text,
	`placeholders` text,
	`created_at` integer,
	`folder_id` text,
	`updated_at` integer,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `snippet_ext_idx` ON `snippets` (`ext`);--> statement-breakpoint
CREATE INDEX `snippet_name_idx` ON `snippets` (`name`);--> statement-breakpoint
CREATE INDEX `snippet_tags_idx` ON `snippets` (`tags`);--> statement-breakpoint
CREATE INDEX `snippet_folder_idx` ON `snippets` (`folder_id`);--> statement-breakpoint
CREATE INDEX `snippet_created_at_idx` ON `snippets` (`created_at`);