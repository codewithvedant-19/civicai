import type { Issue, PriorityBand, Settings, Severity } from "@/domain/types";
import { ConfigRepository } from "@/repositories/miscRepositories";

const SEVERITY_SCORE: Record<Severity, number> = { low: 1, medium: 2, high: 3 };

// All thresholds/weights are read from Settings (Super Admin configurable),
// never hardcoded, per build prompt guardrail #5.
export const PriorityEngine = {
  async computeScoreAndBand(issue: Pick<Issue, "severity" | "confirmations" | "createdAt">): Promise<{
    score: number;
    band: PriorityBand;
  }> {
    const settings = await ConfigRepository.get();
    const t = settings.priorityThresholds;
    const uniqueReporters = 1 + issue.confirmations.length; // original reporter + confirmations

    const ageHours = (Date.now() - new Date(issue.createdAt).getTime()) / 36e5;
    const recencyBoost = Math.max(0, 48 - ageHours) / 48; // fresher issues score slightly higher

    const score =
      SEVERITY_SCORE[issue.severity] * t.severityWeight +
      uniqueReporters * t.reporterWeight +
      recencyBoost * t.recencyWeight;

    let band: PriorityBand = "medium";
    if (uniqueReporters >= t.criticalReporterCount) band = "critical";
    else if (uniqueReporters >= t.highReporterCount) band = "high";

    return { score: Math.round(score * 100) / 100, band };
  },

  async slaDeadline(band: PriorityBand, fromIso: string, settings?: Settings): Promise<string> {
    const cfg = settings ?? (await ConfigRepository.get());
    const hours = cfg.slaHoursByBand[band];
    return new Date(new Date(fromIso).getTime() + hours * 36e5).toISOString();
  },
};
