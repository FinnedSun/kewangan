CREATE TABLE IF NOT EXISTS "transaction_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"amount" bigint,
	"payee" text NOT NULL,
	"notes" text,
	"account_id" text,
	"category_id" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_templates" ADD CONSTRAINT "transaction_templates_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_templates" ADD CONSTRAINT "transaction_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
