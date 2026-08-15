import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/repositories/userRepository";
import { AuthService } from "@/services/authService";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const user = await UserRepository.findByEmail(body.email);
  if (!user || !(await AuthService.verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await AuthService.createSession(user.id);
  return NextResponse.json({ user: AuthService.toPublicUser(user), redirectTo: AuthService.redirectPathForRole(user.role) });
}
