import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { NotificationRepository } from "@/repositories/notificationRepository";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [] });
  const notifications = await NotificationRepository.listByUser(user.id);
  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const user = await AuthService.getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.id) await NotificationRepository.markRead(body.id);
  return NextResponse.json({ ok: true });
}
