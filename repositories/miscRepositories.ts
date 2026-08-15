import { supabaseServer } from "@/lib/supabase";
import type { Officer, Settings, DamageClass, AuditLogEntry, ActiveProviders } from "@/domain/types";
import { v4 as uuid } from "uuid";

export const OfficerRepository = {
  async findByUserId(userId: string): Promise<Officer | undefined> {
    const { data } = await supabaseServer.from("officers").select("*").eq("user_id", userId).maybeSingle();
    return data ? {
      userId: data.user_id,
      authorityId: data.authority_id,
      assignedIssueIds: data.assigned_issue_ids || [],
    } : undefined;
  },

  async listByAuthority(authorityId: string): Promise<Officer[]> {
    const { data } = await supabaseServer.from("officers").select("*").eq("authority_id", authorityId);
    return (data || []).map(o => ({
      userId: o.user_id,
      authorityId: o.authority_id,
      assignedIssueIds: o.assigned_issue_ids || [],
    }));
  },

  async assignIssue(userId: string, issueId: string): Promise<void> {
    const officer = await this.findByUserId(userId);
    if (!officer) return;
    
    if (!officer.assignedIssueIds.includes(issueId)) {
      const newIds = [...officer.assignedIssueIds, issueId];
      await supabaseServer.from("officers").update({ assigned_issue_ids: newIds }).eq("user_id", userId);
    }
  },
};

export const ConfigRepository = {
  async get(): Promise<Settings> {
    const { data } = await supabaseServer.from("settings").select("data").eq("id", "global").maybeSingle();
    if (!data) {
      // Fallback if settings row is missing
      return {
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
    }
    return data.data as Settings;
  },

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const updated = { ...current, ...patch };
    await supabaseServer.from("settings").upsert({ id: "global", data: updated });
    return updated;
  },
};

export const DamageClassRepository = {
  async list(): Promise<DamageClass[]> {
    const { data } = await supabaseServer.from("damage_classes").select("*");
    return (data || []).map(d => ({
      id: d.id,
      label: d.label,
      icon: d.icon,
      defaultSeverityWeight: d.default_severity_weight,
      description: d.description,
    }));
  },

  async findById(id: string): Promise<DamageClass | undefined> {
    const { data } = await supabaseServer.from("damage_classes").select("*").eq("id", id).maybeSingle();
    return data ? {
      id: data.id,
      label: data.label,
      icon: data.icon,
      defaultSeverityWeight: data.default_severity_weight,
      description: data.description,
    } : undefined;
  },
};

export const AuditLogRepository = {
  async log(action: string, details: string, actorId?: string): Promise<AuditLogEntry> {
    const id = uuid();
    const { data, error } = await supabaseServer.from("audit_logs").insert({
      id,
      actor_id: actorId || null,
      action,
      details,
    }).select().single();
    
    if (error) throw error;
    return {
      id: data.id,
      actorId: data.actor_id || undefined,
      action: data.action,
      details: data.details,
      createdAt: data.created_at,
    };
  },

  async list(): Promise<AuditLogEntry[]> {
    const { data } = await supabaseServer.from("audit_logs").select("*").order("created_at", { ascending: false });
    return (data || []).map(d => ({
      id: d.id,
      actorId: d.actor_id || undefined,
      action: d.action,
      details: d.details,
      createdAt: d.created_at,
    }));
  },
};

export function getActiveProviders(): ActiveProviders {
  return {
    ai: process.env.AI_PROVIDER === "yolo" ? "YoloDamageDetectionProvider (not configured)" : "MockDamageDetectionProvider (simulated)",
    reward: process.env.REWARD_PROVIDER === "giftcardapi" ? "GiftCardApiProvider (not configured)" : "MockRewardProvider (simulated)",
    authority: process.env.AUTHORITY_PROVIDER === "cityapi" ? "CityApiIntegration (not configured)" : "SimulatedAuthorityRouter (simulated)",
    geocoding: process.env.GEOCODING_PROVIDER === "mapbox" ? "MapboxGeocodingProvider (not configured)" : "MockGeocodingProvider (simulated)",
  };
}
