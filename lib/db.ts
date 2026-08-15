import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import type {
  User,
  Issue,
  Report,
  Authority,
  Jurisdiction,
  Officer,
  PointsLedgerEntry,
  Badge,
  UserBadge,
  RewardItem,
  Redemption,
  Notification,
  AuditLogEntry,
  DamageClass,
  Settings,
} from "@/domain/types";

// ============================================================================
// This is the ONLY file that knows about lowdb / the on-disk file format.
// Every other part of the app talks to /repositories, never to this file
// or window.storage-style raw access directly. This keeps DB logic centralized
// per the build prompt's modularity mandate (Section 3: "database logic
// remains centralized").
// ============================================================================

export interface DbSchema {
  users: User[];
  issues: Issue[];
  reports: Report[];
  authorities: Authority[];
  jurisdictions: Jurisdiction[];
  officers: Officer[];
  pointsLedger: PointsLedgerEntry[];
  badges: Badge[];
  userBadges: UserBadge[];
  damageClasses: DamageClass[];
  rewardsCatalog: RewardItem[];
  redemptions: Redemption[];
  notifications: Notification[];
  auditLogs: AuditLogEntry[];
  settings: Settings;
}

const defaultData: DbSchema = {
  users: [],
  issues: [],
  reports: [],
  authorities: [],
  jurisdictions: [],
  officers: [],
  pointsLedger: [],
  badges: [],
  userBadges: [],
  damageClasses: [],
  rewardsCatalog: [],
  redemptions: [],
  notifications: [],
  auditLogs: [],
  settings: {
    aiConfidenceThreshold: 0.55,
    priorityThresholds: {
      highReporterCount: 5,
      criticalReporterCount: 10,
      severityWeight: 1,
      reporterWeight: 2,
      recencyWeight: 0.5,
    },
    rateLimitReportsPerHour: 10,
    slaHoursByBand: { medium: 168, high: 72, critical: 24 },
  },
};

const dbFile = path.join(process.cwd(), "data", "db.json");

// IMPORTANT: Next.js compiles each API route into its own bundle, so a
// module-level singleton does NOT reliably share state across different
// route files (writes in one route handler can be invisible to reads in
// another). To keep this centralized-but-correct for the prototype, every
// call re-reads the JSON file from disk rather than trusting an in-memory
// cache. This is the trade-off of a flat-file "DB" — a real Postgres/Supabase
// swap (the intended production path) wouldn't have this issue at all, since
// repositories would talk to a real out-of-process database instead.
export async function getDb(): Promise<Low<DbSchema>> {
  const low = new Low<DbSchema>(new JSONFile<DbSchema>(dbFile), defaultData);
  await low.read();
  if (!low.data) {
    low.data = structuredClone(defaultData);
    await low.write();
  }
  return low;
}
