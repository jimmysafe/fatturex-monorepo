CREATE TABLE `documents` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`original_name` text NOT NULL,
	`stored_name` text NOT NULL,
	`display_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`blob_url` text NOT NULL,
	`storage_path` text NOT NULL,
	`anno` text(4) NOT NULL,
	`category` text DEFAULT 'document',
	`description` text,
	`tags` text,
	`checksum` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_blob_url_unique` ON `documents` (`blob_url`);