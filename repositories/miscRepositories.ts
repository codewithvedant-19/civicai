import { getDb } from "@/lib/db";
import type { Officer, Settings, DamageClass, AuditLogEntry, ActiveProviders } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const OfficerRepository = {
  async findByUserId(userId: string): Promise<Officer | undefined> {
    const db = await getDb();
    return db.data.officers.find((o) => o.userId === userId);
  },

  async listByAuthority(authorityId: string): Promise<Officer[]> {
    const db = await getDb();
    return db.data.officers.filter((o) => o.authorityId === authorityId);
  },

  async assignIssue(userId: string, issueId: string): Promise<void> {
    const db = await getDb();
    const officer = db.data.officers.find((o) => o.userId === userId);
    if (officer && !officer.assignedIssueIds.includes(issueId)) {
      officer.assignedIssueIds.push(issueId);
      await db.write();
    }
  },
};

// Config/settings repository — backs the Super Admin tunable thresholds
// (confidence cutoff, priority bands, SLA hours, rate limits). Reading from
// here rather than hardcoding is what makes "adjust a threshold and see it
// take effect" (acceptance criterion #7) actually true.
export const ConfigRepository = {
  async get(): Promise<Settings> {
    const db = await getDb();
    return db.data.settings;
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const db = await getDb();
    db.data.settings = { ...db.data.settings, ...patch };
    await db.write();
    return db.data.settings;
  },
};

export const DamageClassRepository = {
  async list(): Promise<DamageClass[]> {
    const db = await getDb();
    return db.data.damageClasses;
  },

  async findById(id: string): Promise<DamageClass | undefined> {
    const db = await getDb();
    return db.data.damageClasses.find((d) => d.id === id);
  },
};

export const AuditLogRepository = {
  async log(action: string, details: string, actorId?: string): Promise<AuditLogEntry> {
    const db = await getDb();
    const entry: AuditLogEntry = { id: uuid(), actorId, action, details, createdAt: new Date().toISOString() };
    db.data.auditLogs.push(entry);
    await db.write();
    return entry;
  },

  async list(): Promise<AuditLogEntry[]> {
    const db = await getDb();
    return db.data.auditLogs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
