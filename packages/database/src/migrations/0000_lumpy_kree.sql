CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`name` text NOT NULL,
	`nome` text,
	`cognome` text,
	`telefono` text,
	`onboarded` integer DEFAULT false NOT NULL,
	`image` text,
	`data_di_nascita` integer,
	`role` text DEFAULT 'user' NOT NULL,
	`cassa` text,
	`logo_path` text,
	`theme_color` text DEFAULT '#6038ff',
	`customer_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `clienti` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ragione_sociale` text,
	`nome` text,
	`cognome` text,
	`telefono` text,
	`telefono_fisso` text,
	`indirizzo_email` text NOT NULL,
	`indirizzo_pec` text,
	`indirizzo` text NOT NULL,
	`cap` text NOT NULL,
	`comune` text NOT NULL,
	`provincia` text,
	`paese` text DEFAULT 'IT' NOT NULL,
	`partita_iva` text,
	`codice_fiscale` text,
	`codice_destinatario` text DEFAULT '0000000',
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `codice_ateco` (
	`codice` text PRIMARY KEY NOT NULL,
	`genitore_id` text,
	`sezione` text NOT NULL,
	`descrizione` text,
	`coefficiente_redditivita` decimal(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contabilita` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`anno` integer NOT NULL,
	`da_ricalcolare` integer DEFAULT false NOT NULL,
	`fatturato` decimal(10, 2) DEFAULT 0 NOT NULL,
	`totale_tasse` decimal(10, 2) DEFAULT 0 NOT NULL,
	`reddito_netto` decimal(10, 2) DEFAULT 0 NOT NULL,
	`da_pagare` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributi_versati` decimal(10, 2) DEFAULT 0 NOT NULL,
	`saldo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`acconto` decimal(10, 2) DEFAULT 0 NOT NULL,
	`residuo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`ril` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo_soggettivo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo_integrativo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo_modulare` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo_soggettivo_minimo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo_integrativo_minimo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo_modulare_minimo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`acconto_is` decimal(10, 2) DEFAULT 0 NOT NULL,
	`da_pagare_is` decimal(10, 2) DEFAULT 0 NOT NULL,
	`residuo_is` decimal(10, 2) DEFAULT 0 NOT NULL,
	`saldo_is` decimal(10, 2) DEFAULT 0 NOT NULL,
	`percentuale_modulare` decimal(10, 2) DEFAULT 0 NOT NULL,
	`agevolazione` integer DEFAULT false NOT NULL,
	`enpapi_tipo_agevolazione` text DEFAULT 'NOT_SET' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fatture` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`cliente_id` text NOT NULL,
	`indirizzo_id` text NOT NULL,
	`numero_progressivo` integer NOT NULL,
	`numero_progressivo_nota_credito` integer,
	`data_emissione` integer NOT NULL,
	`data_saldo` integer,
	`data_nota_credito` integer,
	`data_invio_email` integer,
	`stato` text NOT NULL,
	`addebita_contributo` integer DEFAULT false,
	`addebita_marca_da_bollo` integer DEFAULT false,
	`totale_fattura` decimal(10, 2) DEFAULT 0 NOT NULL,
	`parziale_fattura` decimal(10, 2) DEFAULT 0 NOT NULL,
	`contributo` decimal(10, 2) DEFAULT 0,
	`saldo_gs` decimal(10, 2) DEFAULT 0 NOT NULL,
	`acconto_gs` decimal(10, 2) DEFAULT 0 NOT NULL,
	`residuo_gs` decimal(10, 2) DEFAULT 0 NOT NULL,
	`totale_gs` decimal(10, 2) DEFAULT 0 NOT NULL,
	`da_pagare_gs` decimal(10, 2) DEFAULT 0 NOT NULL,
	`netto` decimal(10, 2) DEFAULT 0 NOT NULL,
	`ricavo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`ricavo_tassabile` decimal(10, 2) DEFAULT 0 NOT NULL,
	`ril` decimal(10, 2) DEFAULT 0 NOT NULL,
	`saldo_is` decimal(10, 2) DEFAULT 0,
	`ril_is` decimal(10, 2) DEFAULT 0,
	`acconto_is` decimal(10, 2) DEFAULT 0,
	`residuo_is` decimal(10, 2) DEFAULT 0,
	`totale_is` decimal(10, 2) DEFAULT 0,
	`da_pagare_is` decimal(10, 2) DEFAULT 0,
	`totale_tasse` decimal(10, 2) DEFAULT 0 NOT NULL,
	`integrativo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`modulare` decimal(10, 2) DEFAULT 0 NOT NULL,
	`soggettivo` decimal(10, 2) DEFAULT 0 NOT NULL,
	`id_marca_da_bollo` text,
	`metodo_pagamento` text NOT NULL,
	`preferenza_data_saldo` text DEFAULT '0' NOT NULL,
	`sts_stato` text DEFAULT 'Non Inviata' NOT NULL,
	`sts_protocollo` text,
	`fte_stato` text DEFAULT 'Non Inviata' NOT NULL,
	`fte_id` text(36),
	`fte_error` text,
	`lingua` text DEFAULT 'IT' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cliente_id`) REFERENCES `clienti`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`indirizzo_id`) REFERENCES `indirizzi`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fattura_articoli` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`descrizione` text NOT NULL,
	`quantita` integer DEFAULT 1 NOT NULL,
	`prezzo` decimal(10, 2) NOT NULL,
	`fattura_id` text NOT NULL,
	FOREIGN KEY (`fattura_id`) REFERENCES `fatture`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `indirizzi` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`indirizzo` text NOT NULL,
	`comune` text NOT NULL,
	`cap` text NOT NULL,
	`provincia` text NOT NULL,
	`paese` text DEFAULT 'IT' NOT NULL,
	`default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `partita_iva` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`codice_fiscale` text NOT NULL,
	`numero` text NOT NULL,
	`codice_ateco` text NOT NULL,
	`data_apertura` integer NOT NULL,
	`indirizzo` text NOT NULL,
	`cap` text NOT NULL,
	`comune` text NOT NULL,
	`provincia` text NOT NULL,
	`paese` text DEFAULT 'IT' NOT NULL,
	`coefficiente_redditivita` decimal(10, 2) NOT NULL,
	`iban` text,
	`iban_intestatario` text,
	`iban_banca` text,
	`data_iscrizione_cassa` integer,
	`fte_configuration_id` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `partita_iva_numero_unique` ON `partita_iva` (`numero`);--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`stato` text DEFAULT 'Attivo' NOT NULL,
	`plan` text NOT NULL,
	`plan_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	`email` text,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`user_id` text NOT NULL,
	`invoices_limit` integer DEFAULT 0 NOT NULL,
	`invoices_count` integer DEFAULT 0 NOT NULL,
	`searches_limit` integer DEFAULT 0 NOT NULL,
	`searches_count` integer DEFAULT 0 NOT NULL,
	`fte_enabled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `email_idx` ON `subscription` (`email`);--> statement-breakpoint
CREATE INDEX `plan_idx` ON `subscription` (`plan`);--> statement-breakpoint
CREATE TABLE `tassa_maternita` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`anno` integer NOT NULL,
	`cassa` text NOT NULL,
	`prezzo` decimal(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `template_articoli` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`descrizione` text NOT NULL,
	`quantita` integer DEFAULT 1 NOT NULL,
	`prezzo` decimal(10, 2) NOT NULL,
	`template_id` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
