CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer,
	"title" text,
	"content" text,
	"type" text,
	"valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"classId" integer,
	"date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "graduations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"belt" text,
	"degree" integer,
	"modality" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class" (
	"id" serial PRIMARY KEY NOT NULL,
	"gym_id" integer,
	"instructor_id" integer,
	"created_by" integer,
	"day" text,
	"start" text,
	"end" text,
	"modality" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"logo" text,
	"managerId" integer NOT NULL,
	"since" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"store" text,
	"url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"disabled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"appVersion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"disabled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"profile_picture" text,
	"birth" text,
	"birth_day" text,
	"gender" text,
	"phone" text,
	"instagram" text,
	"role" text,
	"gym_id" integer,
	"expo_push_token" text,
	"customer_id" text,
	"subscription_id" text,
	"plan" text,
	"approved_at" timestamp,
	"denied_at" timestamp,
	"migrated_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"sent_by" integer,
	"title" text,
	"content" text,
	"channel" text,
	"status" text,
	"recipients" text[],
	"viewed_by" text[],
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
