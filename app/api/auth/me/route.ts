import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: AuthService.toPublicUser(user) });
}
