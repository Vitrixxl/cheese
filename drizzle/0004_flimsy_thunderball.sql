DROP TABLE `users_to_games`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_game` (
	`id` text PRIMARY KEY NOT NULL,
	`pgn` text NOT NULL,
	`category` text NOT NULL,
	`timeControl` text NOT NULL,
	`whiteId` text NOT NULL,
	`blackId` text NOT NULL,
	`outcome` text NOT NULL,
	`winner` text,
	`messages` text DEFAULT '[]',
	`whiteTimer` real NOT NULL,
	`blackTimer` real NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`whiteId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`blackId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_game`("id", "pgn", "category", "timeControl", "whiteId", "blackId", "outcome", "winner", "messages", "whiteTimer", "blackTimer", "createdAt") SELECT "id", "pgn", "category", "timeControl", "whiteId", "blackId", "outcome", "winner", "messages", "whiteTimer", "blackTimer", "createdAt" FROM `game`;--> statement-breakpoint
DROP TABLE `game`;--> statement-breakpoint
ALTER TABLE `__new_game` RENAME TO `game`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `users_to_chats` ADD `lastSeenAt` integer;