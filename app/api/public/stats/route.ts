import { NextResponse } from "next/server";
import { IssueRepository } from "@/repositories/issueRepository";
import { AuthorityRepository } from "@/repositories/jurisdictionRepository";
import { DamageClassRepository } from "@/repositories/miscRepositories";

// Public transparency endpoint: aggregated only, never exposes reporter identity.
export async function GET() {
  const issues = await IssueRepository.list();
  const authorities = await AuthorityRepository.list();
  const damageClasses = await DamageClassRepository.list();

  const bySeverity = { low: 0, medium: 0, high: 0 };
  const byBand = { medium: 0, high: 0, critical: 0 };
  const byStatus: Record<string, number> = {};
  const byClass: Record<string, number> = {};

  for (const i of issues) {
    bySeverity[i.severity]++;
    byBand[i.priorityBand]++;
    byStatus[i.status] = (byStatus[i.status] ?? 0) + 1;
    byClass[i.damageClassId] = (byClass[i.damageClassId] ?? 0) + 1;
  }

  const publicIssues = issues.map((i) => ({
    id: i.id,
    lat: i.lat,
    lng: i.lng,
    address: i.address,
    severity: i.severity,
    priorityBand: i.priorityBand,
    status: i.status,
    damageClassId: i.damageClassId,
    routedTo: i.routedTo,
    isSimulatedRouting: i.isSimulatedRouting,
    createdAt: i.createdAt,
  }));

  return NextResponse.json({
    totalIssues: issues.length,
    resolved: byStatus["resolved"] ?? 0,
    bySeverity,
    byBand,
    byStatus,
    byClass,
    authorities: authorities.map((a) => ({ id: a.id, name: a.name, isSimulated: a.isSimulated })),
    damageClasses,
    issues: publicIssues,
  });
}
