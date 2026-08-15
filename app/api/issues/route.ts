import { NextRequest, NextResponse } from "next/server";
import { IssueRepository } from "@/repositories/issueRepository";
import { AuthService } from "@/services/authService";

export async function GET(req: NextRequest) {
  const user = await AuthService.getCurrentUser();
  const all = await IssueRepository.list();

  const authorityId = req.nextUrl.searchParams.get("authorityId");
  const mine = req.nextUrl.searchParams.get("mine");

  let filtered = all;
  if (authorityId) filtered = filtered.filter((i) => i.authorityId === authorityId);
  if (mine === "true" && user) filtered = filtered.filter((i) => i.reporterId === user.id);

  // Public transparency view never exposes reporter identity.
  const isPrivileged = user && ["officer", "authority_admin", "super_admin"].includes(user.role);
  const shaped = filtered.map((i) => (isPrivileged ? i : { ...i, reporterId: undefined }));

  return NextResponse.json({ issues: shaped });
}
