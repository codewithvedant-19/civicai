import { getDb } from "../lib/db";
import { AuthService } from "../services/authService";
import { v4 as uuid } from "uuid";

async function main() {
  const db = await getDb();

  // Reset for a clean, repeatable demo
  db.data.users = [];
  db.data.issues = [];
  db.data.reports = [];
  db.data.authorities = [];
  db.data.jurisdictions = [];
  db.data.officers = [];
  db.data.pointsLedger = [];
  db.data.badges = [];
  db.data.userBadges = [];
  db.data.damageClasses = [];
  db.data.rewardsCatalog = [];
  db.data.redemptions = [];
  db.data.notifications = [];
  db.data.auditLogs = [];

  // --- Damage classes (config-driven; add rows here to support new classes) ---
  db.data.damageClasses = [
    { id: "pothole", label: "Pothole", icon: "circle-dot", defaultSeverityWeight: 3, description: "A hole or depression in the road surface." },
    { id: "crack", label: "Surface crack", icon: "zap", defaultSeverityWeight: 2, description: "Longitudinal or alligator cracking in the pavement." },
    { id: "waterlogging", label: "Waterlogging", icon: "droplets", defaultSeverityWeight: 2, description: "Standing water indicating drainage failure." },
    { id: "faded_marking", label: "Faded road marking", icon: "minus", defaultSeverityWeight: 1, description: "Lane markings too worn to be visible." },
    { id: "broken_signage", label: "Broken signage", icon: "octagon-alert", defaultSeverityWeight: 2, description: "Damaged, missing, or obscured road sign." },
  ];

  // --- Jurisdictions / authorities (multi-city by design) ---
  const springfieldAuthorityId = uuid();
  const rivertonAuthorityId = uuid();
  db.data.authorities = [
    { id: springfieldAuthorityId, name: "Springfield Dept. of Public Works", jurisdictionId: "springfield", isSimulated: true },
    { id: rivertonAuthorityId, name: "Riverton City Roads Division", jurisdictionId: "riverton", isSimulated: true },
  ];
  db.data.jurisdictions = [
    {
      id: "springfield",
      city: "Springfield",
      state: "IL",
      country: "USA",
      authorityId: springfieldAuthorityId,
      bounds: { minLat: 39.7, maxLat: 39.9, minLng: -89.75, maxLng: -89.55 },
    },
    {
      id: "riverton",
      city: "Riverton",
      state: "IL",
      country: "USA",
      authorityId: rivertonAuthorityId,
      bounds: { minLat: 39.5, maxLat: 39.7, minLng: -89.2, maxLng: -89.0 },
    },
  ];

  // --- Badges ---
  db.data.badges = [
    { id: "first_report", label: "First Report", description: "Submitted your first verified report.", icon: "flag" },
    { id: "streak_5", label: "5-Day Streak", description: "Reported activity 5 days in a row.", icon: "flame" },
    { id: "verified_10", label: "Verified 10 Reports", description: "10 AI-verified reports submitted.", icon: "badge-check" },
    { id: "critical_spotter", label: "Critical Issue Spotter", description: "Reported an issue that reached Critical priority.", icon: "siren" },
    { id: "repair_confirmed", label: "Repair Confirmed", description: "One of your reports was resolved.", icon: "check-circle" },
  ];

  // --- Rewards catalog ---
  db.data.rewardsCatalog = [
    { id: "coffee5", label: "$5 Coffee Voucher", description: "Redeemable at partner cafes (simulated).", pointCost: 100, stock: 50 },
    { id: "transit10", label: "$10 Transit Card Top-up", description: "Simulated public transit credit.", pointCost: 200, stock: 30 },
    { id: "hardware15", label: "$15 Hardware Store Voucher", description: "Simulated home-improvement voucher.", pointCost: 350, stock: 20 },
    { id: "tshirt", label: "CivicRoad AI T-Shirt", description: "Simulated merch reward.", pointCost: 500, stock: 10 },
  ];

  // --- Seed users, one per role ---
  const mk = async (name: string, email: string, role: any, authorityId?: string) => {
    const passwordHash = await AuthService.hashPassword("password123");
    const user = {
      id: uuid(),
      name,
      email,
      passwordHash,
      role,
      pointsBalance: 0,
      level: 1,
      streakCount: 0,
      lastActivityDate: null,
      authorityId,
      createdAt: new Date().toISOString(),
    };
    db.data.users.push(user);
    return user;
  };

  const citizen1 = await mk("Amara Chen", "citizen@demo.dev", "citizen");
  const citizen2 = await mk("Devon Fields", "citizen2@demo.dev", "citizen");
  const officer = await mk("Officer Priya Nair", "officer@demo.dev", "officer", springfieldAuthorityId);
  const authorityAdmin = await mk("Marcus Lee", "authority@demo.dev", "authority_admin", springfieldAuthorityId);
  await mk("Super Admin", "admin@demo.dev", "super_admin");

  db.data.officers.push({ userId: officer.id, authorityId: springfieldAuthorityId, assignedIssueIds: [] });

  await db.write();

  console.log("Seed complete. Demo logins (password: password123):");
  console.log("  citizen@demo.dev       (Citizen)");
  console.log("  citizen2@demo.dev      (Citizen — for confirming issues)");
  console.log("  officer@demo.dev       (Authority Officer)");
  console.log("  authority@demo.dev     (Authority Admin)");
  console.log("  admin@demo.dev         (Super Admin)");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
