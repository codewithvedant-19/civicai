import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";

export async function POST() {
  await AuthService.clearSession();
  return NextResponse.json({ ok: true });
}
