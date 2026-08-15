import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { UserRepository } from "@/repositories/userRepository";
import { OfficerRepository, AuditLogRepository } from "@/repositories/miscRepositories";
import { AuthorityRepository, JurisdictionRepository } from "@/repositories/jurisdictionRepository";
import { db } from "@/db";
import { officers } from "@/db/schema";
import type { Role } from "@/domain/types";

// This is the ONLY place a user's role can become authority_admin, officer,
// or super_admin — never via signup (build prompt guardrail #2).
export async function GET() {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const users = await UserRepository.list();
  const authorities = await AuthorityRepository.list();
  const jurisdictions = await JurisdictionRepository.list();
  const auditLogs = await AuditLogRepository.list();
  return NextResponse.json({
    users: users.map((u) => AuthService.toPublicUser(u)),
    authorities,
    jurisdictions,
    auditLogs: auditLogs.slice(0, 50),
  });
}

export async function POST(req: NextRequest) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const body = await req.json().catch(() => null);
  const { userId, role, authorityId } = (body ?? {}) as { userId?: string; role?: Role; authorityId?: string };
  if (!userId || !role) return NextResponse.json({ error: "userId and role are required." }, { status: 400 });

  const target = await UserRepository.findById(userId);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  await UserRepository.update(userId, { role, authorityId: authorityId ?? target.authorityId });

  if (role === "officer" && authorityId) {
    const existing = await OfficerRepository.findByUserId(userId);
    if (!existing) {
      await db.insert(officers).values({ userId, authorityId, assignedIssueIds: [] });
    }
  }

  await AuditLogRepository.log("role_assigned", `${target.email} -> ${role}`, user!.id);
  return NextResponse.json({ ok: true });
}
