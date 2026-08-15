import { db } from "@/db";
import { officers, settings, damageClasses, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Officer, Settings, DamageClass, AuditLogEntry, ActiveProviders } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const OfficerRepository = {
  async findByUserId(userId: string): Promise<Officer | undefined> {
    const [officer] = await db.select().from(officers).where(eq(officers.userId, userId));
    return officer as Officer | undefined;
  },

  async listByAuthority(authorityId: string): Promise<Officer[]> {
    return (await db.select().from(officers).where(eq(officers.authorityId, authorityId))) as Officer[];
  },

  async assignIssue(userId: string, issueId: string): Promise<void> {
    const officer = await this.findByUserId(userId);
    if (officer && !officer.assignedIssueIds.includes(issueId)) {
      await db
        .update(officers)
        .set({ assignedIssueIds: [...officer.assignedIssueIds, issueId] })
        .where(eq(officers.userId, userId));
    }
  },
};

const defaultSettings: Settings = {
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
};

// Config/settings repository — backs the Super Admin tunable thresholds
// (confidence cutoff, priority bands, SLA hours, rate limits). Reading from
// here rather than hardcoding is what makes "adjust a threshold and see it
// take effect" (acceptance criterion #7) actually true.
export const ConfigRepository = {
  async get(): Promise<Settings> {
    const [row] = await db.select().from(settings).where(eq(settings.id, 1));
    if (row) {
      const { id, ...rest } = row;
      return rest as Settings;
    }
    await db.insert(settings).values({ id: 1, ...defaultSettings }).onConflictDoNothing();
    return defaultSettings;
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const next = { ...current, ...patch };
    await db
      .insert(settings)
      .values({ id: 1, ...next })
      .onConflictDoUpdate({ target: settings.id, set: next });
    return next;
  },
};

export const DamageClassRepository = {
  async list(): Promise<DamageClass[]> {
    return (await db.select().from(damageClasses)) as DamageClass[];
  },

  async findById(id: string): Promise<DamageClass | undefined> {
    const [row] = await db.select().from(damageClasses).where(eq(damageClasses.id, id));
    return row as DamageClass | undefined;
  },
};

export const AuditLogRepository = {
  async log(action: string, details: string, actorId?: string): Promise<AuditLogEntry> {
    const [entry] = await db
      .insert(auditLogs)
      .values({ id: uuid(), actorId, action, details, createdAt: new Date().toISOString() })
      .returning();
    return entry as AuditLogEntry;
  },

  async list(): Promise<AuditLogEntry[]> {
    return (await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt))) as AuditLogEntry[];
  },
};

// Read-only view of which provider is active per interface, for the
// authority-side "Integration status panel" (Section 7) that makes the
// modular provider setup visible/provable in the demo.
export function getActiveProviders(): ActiveProviders {
  return {
    ai: process.env.AI_PROVIDER === "yolo" ? "YoloDamageDetectionProvider (not configured)" : "MockDamageDetectionProvider (simulated)",
    reward: process.env.REWARD_PROVIDER === "giftcardapi" ? "GiftCardApiProvider (not configured)" : "MockRewardProvider (simulated)",
    authority: process.env.AUTHORITY_PROVIDER === "cityapi" ? "CityApiIntegration (not configured)" : "SimulatedAuthorityRouter (simulated)",
    geocoding: process.env.GEOCODING_PROVIDER === "mapbox" ? "MapboxGeocodingProvider (not configured)" : "MockGeocodingProvider (simulated)",
  };
}
