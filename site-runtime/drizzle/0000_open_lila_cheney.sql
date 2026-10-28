CREATE TABLE `token_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`source_hash` text NOT NULL,
	`revision` integer NOT NULL,
	`edits_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `token_history` (
	`revision` integer PRIMARY KEY NOT NULL,
	`source_hash` text NOT NULL,
	`edits_json` text NOT NULL,
	`updated_at` text NOT NULL
);
