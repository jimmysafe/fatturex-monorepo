CREATE TABLE `nota_di_credito` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`numero_progressivo` integer NOT NULL,
	`data_nota_credito` integer,
	`totale_fattura` decimal(10, 2) DEFAULT 0 NOT NULL,
	`fte_stato` text DEFAULT 'Non Inviata' NOT NULL,
	`fte_id` text(36),
	`fte_error` text,
	`fattura_id` text NOT NULL,
	`lingua` text DEFAULT 'IT' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fattura_id`) REFERENCES `fatture`(`id`) ON UPDATE no action ON DELETE cascade
);
