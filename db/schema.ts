import { pgTable, text, integer, boolean, real, jsonb, primaryKey } from "drizzle-orm/pg-core";
import type { BoundingBox, Confirmation, RepairEvidence, PriorityThresholds, PriorityBand } from "@/domain/types";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  pointsBalance: integer("points_balance").notNull().default(0),
  level: integer("level").notNull().default(1),
  streakCount: integer("streak_count").notNull().default(0),
  lastActivityDate: text("last_activity_date"),
  authorityId: text("authority_id"),
  createdAt: text("created_at").notNull(),
});

export const damageClasses = pgTable("damage_classes", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  defaultSeverityWeight: integer("default_severity_weight").notNull(),
  description: text("description").notNull(),
});

export const authorities = pgTable("authorities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  jurisdictionId: text("jurisdiction_id").notNull(),
  isSimulated: boolean("is_simulated").notNull().default(false),
});

export const jurisdictions = pgTable("jurisdictions", {
  id: text("id").primaryKey(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  authorityId: text("authority_id").notNull(),
  minLat: real("min_lat").notNull(),
  maxLat: real("max_lat").notNull(),
  minLng: real("min_lng").notNull(),
  maxLng: real("max_lng").notNull(),
});

export const officers = pgTable("officers", {
  userId: text("user_id").primaryKey(),
  authorityId: text("authority_id").notNull(),
  assignedIssueIds: jsonb("assigned_issue_ids").$type<string[]>().notNull().default([]),
});

export const issues = pgTable("issues", {
  id: text("id").primaryKey(),
  damageClassId: text("damage_class_id").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  address: text("address").notNull(),
  jurisdictionId: text("jurisdiction_id").notNull(),
  authorityId: text("authority_id"),
  routedTo: text("routed_to"),
  isSimulatedRouting: boolean("is_simulated_routing"),
  reporterId: text("reporter_id").notNull(),
  imageUrl: text("image_url").notNull(),
  imageHash: text("image_hash").notNull(),
  aiConfidence: real("ai_confidence").notNull(),
  boundingBox: jsonb("bounding_box").$type<BoundingBox>().notNull(),
  confirmations: jsonb("confirmations").$type<Confirmation[]>().notNull().default([]),
  priorityScore: integer("priority_score").notNull(),
  priorityBand: text("priority_band").notNull(),
  assignedOfficerId: text("assigned_officer_id"),
  slaDeadline: text("sla_deadline"),
  repairEvidence: jsonb("repair_evidence").$type<RepairEvidence>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull(),
  userId: text("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  aiConfidence: real("ai_confidence").notNull(),
  boundingBox: jsonb("bounding_box").$type<BoundingBox>().notNull(),
  imageHash: text("image_hash").notNull(),
  isDuplicateOf: text("is_duplicate_of"),
  createdAt: text("created_at").notNull(),
});

export const pointsLedger = pgTable("points_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  eventType: text("event_type").notNull(),
  amount: integer("amount").notNull(),
  relatedIssueId: text("related_issue_id"),
  createdAt: text("created_at").notNull(),
});

export const badges = pgTable("badges", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    userId: text("user_id").notNull(),
    badgeId: text("badge_id").notNull(),
    earnedAt: text("earned_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })]
);

export const rewardsCatalog = pgTable("rewards_catalog", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  pointCost: integer("point_cost").notNull(),
  stock: integer("stock").notNull(),
});

export const redemptions = pgTable("redemptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  rewardId: text("reward_id").notNull(),
  pointCost: integer("point_cost").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  relatedIssueId: text("related_issue_id"),
  read: boolean("read").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  details: text("details").notNull(),
  createdAt: text("created_at").notNull(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  aiConfidenceThreshold: real("ai_confidence_threshold").notNull(),
  priorityThresholds: jsonb("priority_thresholds").$type<PriorityThresholds>().notNull(),
  rateLimitReportsPerHour: integer("rate_limit_reports_per_hour").notNull(),
  slaHoursByBand: jsonb("sla_hours_by_band").$type<Record<PriorityBand, number>>().notNull(),
});
