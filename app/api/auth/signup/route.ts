import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/repositories/userRepository";
import { AuthService } from "@/services/authService";

// Guardrail (Section 4 / 11): signup NEVER accepts a role from the client.
// Every account created here is hardcoded to "citizen". Admin/Authority roles
// are only ever granted via the Super Admin invite flow (/api/admin/users).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  const existing = await UserRepository.findByEmail(body.email);
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }
  const passwordHash = await AuthService.hashPassword(body.password);
  const user = await UserRepository.create({
    name: body.name,
    email: body.email,
    passwordHash,
    role: "citizen",
  });
  await AuthService.createSession(user.id);
  return NextResponse.json({ user: AuthService.toPublicUser(user), redirectTo: AuthService.redirectPathForRole(user.role) });
}
