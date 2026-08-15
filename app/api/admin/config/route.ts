import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { RbacService } from "@/services/rbacService";
import { ConfigRepository, getActiveProviders } from "@/repositories/miscRepositories";
import { AuditLogRepository } from "@/repositories/miscRepositories";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });
  const settings = await ConfigRepository.get();
  const activeProviders = getActiveProviders();
  return NextResponse.json({ settings, activeProviders });
}

export async function PATCH(req: NextRequest) {
  const user = await AuthService.getCurrentUser();
  const rbac = RbacService.requireRole(user, ["super_admin"]);
  if (!rbac.ok) return NextResponse.json({ error: rbac.message }, { status: rbac.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const updated = await ConfigRepository.update(body);
  await AuditLogRepository.log("settings_updated", JSON.stringify(body), user!.id);
  return NextResponse.json({ settings: updated });
}
