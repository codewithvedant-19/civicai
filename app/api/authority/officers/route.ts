import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { OfficerRepository } from "@/repositories/miscRepositories";
import { UserRepository } from "@/repositories/userRepository";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["officer", "authority_admin", "super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });
  if (!user!.authorityId) return NextResponse.json({ officers: [] });

  const officers = await OfficerRepository.listByAuthority(user!.authorityId);
  const users = await UserRepository.list();
  const shaped = officers.map((o) => {
    const u = users.find((x) => x.id === o.userId);
    return { userId: o.userId, name: u?.name ?? "Unknown", assignedCount: o.assignedIssueIds.length };
  });
  return NextResponse.json({ officers: shaped });
}
