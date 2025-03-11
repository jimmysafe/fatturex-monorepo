DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "partita_iva_numero_unique";--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
DROP INDEX "plan_idx";--> statement-breakpoint
ALTER TABLE `fatture` ALTER COLUMN "metodo_pagamento" TO "metodo_pagamento" text NOT NULL DEFAULT 'Contanti';--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `partita_iva_numero_unique` ON `partita_iva` (`numero`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `subscription` (`email`);--> statement-breakpoint
CREATE INDEX `plan_idx` ON `subscription` (`plan`);