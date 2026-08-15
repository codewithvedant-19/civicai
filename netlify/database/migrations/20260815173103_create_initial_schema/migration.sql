CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"actor_id" text,
	"action" text NOT NULL,
	"details" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authorities" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"jurisdiction_id" text NOT NULL,
	"is_simulated" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" text PRIMARY KEY,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "damage_classes" (
	"id" text PRIMARY KEY,
	"label" text NOT NULL,
	"icon" text NOT NULL,
	"default_severity_weight" integer NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" text PRIMARY KEY,
	"damage_class_id" text NOT NULL,
	"severity" text NOT NULL,
	"status" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"address" text NOT NULL,
	"jurisdiction_id" text NOT NULL,
	"authority_id" text,
	"routed_to" text,
	"is_simulated_routing" boolean,
	"reporter_id" text NOT NULL,
	"image_url" text NOT NULL,
	"image_hash" text NOT NULL,
	"ai_confidence" real NOT NULL,
	"bounding_box" jsonb NOT NULL,
	"confirmations" jsonb DEFAULT '[]' NOT NULL,
	"priority_score" integer NOT NULL,
	"priority_band" text NOT NULL,
	"assigned_officer_id" text,
	"sla_deadline" text,
	"repair_evidence" jsonb,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdictions" (
	"id" text PRIMARY KEY,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"authority_id" text NOT NULL,
	"min_lat" real NOT NULL,
	"max_lat" real NOT NULL,
	"min_lng" real NOT NULL,
	"max_lng" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"related_issue_id" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "officers" (
	"user_id" text PRIMARY KEY,
	"authority_id" text NOT NULL,
	"assigned_issue_ids" jsonb DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_ledger" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"amount" integer NOT NULL,
	"related_issue_id" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redemptions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"reward_id" text NOT NULL,
	"point_cost" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY,
	"issue_id" text NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text NOT NULL,
	"ai_confidence" real NOT NULL,
	"bounding_box" jsonb NOT NULL,
	"image_hash" text NOT NULL,
	"is_duplicate_of" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards_catalog" (
	"id" text PRIMARY KEY,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"point_cost" integer NOT NULL,
	"stock" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY,
	"ai_confidence_threshold" real NOT NULL,
	"priority_thresholds" jsonb NOT NULL,
	"rate_limit_reports_per_hour" integer NOT NULL,
	"sla_hours_by_band" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"user_id" text,
	"badge_id" text,
	"earned_at" text NOT NULL,
	CONSTRAINT "user_badges_pkey" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"points_balance" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"streak_count" integer DEFAULT 0 NOT NULL,
	"last_activity_date" text,
	"authority_id" text,
	"created_at" text NOT NULL
);
