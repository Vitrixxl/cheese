CREATE TABLE `elo` (
	`userId` text NOT NULL,
	`gameType` text NOT NULL,
	`elo` integer DEFAULT 500 NOT NULL,
	PRIMARY KEY(`userId`, `gameType`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `chat` ADD `name` text;--> statement-breakpoint
ALTER TABLE `game` ADD `moves` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `elo`;