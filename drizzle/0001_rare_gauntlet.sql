CREATE TABLE `puzzle` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fen` text NOT NULL,
	`moves` text NOT NULL,
	`themes` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user` ADD `puzzleLevel` integer DEFAULT 1 NOT NULL;