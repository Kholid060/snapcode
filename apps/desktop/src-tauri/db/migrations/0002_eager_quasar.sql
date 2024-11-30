ALTER TABLE `folders` ADD `is_bookmark` integer;--> statement-breakpoint
CREATE INDEX `folder_bookmark_idx` ON `folders` (`is_bookmark`);--> statement-breakpoint
ALTER TABLE `snippets` ADD `is_bookmark` integer;--> statement-breakpoint
CREATE INDEX `snippet_bookmark_idx` ON `snippets` (`is_bookmark`);