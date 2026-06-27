CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"sort_order" integer NOT NULL,
	"name" text NOT NULL,
	"year" text NOT NULL,
	"url" text NOT NULL,
	"handle" text NOT NULL,
	"tech" jsonb NOT NULL,
	"brief_en" text NOT NULL,
	"brief_tr" text NOT NULL,
	"derived" jsonb,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "projects_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "site_knowledge" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"bio" text NOT NULL,
	"experience" text NOT NULL,
	"skills" jsonb NOT NULL,
	"availability" text NOT NULL,
	"flagship_project" text NOT NULL,
	"contact_email" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
