import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { supabaseServer } from "./lib/supabase";
import { v4 as uuid } from "uuid";

async function seed() {
  console.log("Seeding Supabase static data...");

  // 1. Damage Classes
  const damageClasses = [
    { id: "pothole", label: "Pothole", icon: "circle-dot", default_severity_weight: 3, description: "A hole or depression in the road surface." },
    { id: "crack", label: "Surface crack", icon: "zap", default_severity_weight: 2, description: "Longitudinal or alligator cracking in the pavement." },
    { id: "waterlogging", label: "Waterlogging", icon: "droplets", default_severity_weight: 2, description: "Standing water indicating drainage failure." },
    { id: "faded_marking", label: "Faded road marking", icon: "minus", default_severity_weight: 1, description: "Lane markings too worn to be visible." },
    { id: "broken_signage", label: "Broken signage", icon: "octagon-alert", default_severity_weight: 2, description: "Damaged, missing, or obscured road sign." },
  ];
  await supabaseServer.from("damage_classes").upsert(damageClasses);

  // 2. Authorities & Jurisdictions
  const springfieldAuthorityId = uuid();
  const rivertonAuthorityId = uuid();
  const authorities = [
    { id: springfieldAuthorityId, name: "Springfield Dept. of Public Works", jurisdiction_id: "springfield", is_simulated: true },
    { id: rivertonAuthorityId, name: "Riverton City Roads Division", jurisdiction_id: "riverton", is_simulated: true },
  ];
  await supabaseServer.from("authorities").upsert(authorities);

  const jurisdictions = [
    {
      id: "springfield",
      city: "Springfield",
      state: "IL",
      country: "USA",
      authority_id: springfieldAuthorityId,
      bounds: { minLat: 39.7, maxLat: 39.9, minLng: -89.75, maxLng: -89.55 },
    },
    {
      id: "riverton",
      city: "Riverton",
      state: "IL",
      country: "USA",
      authority_id: rivertonAuthorityId,
      bounds: { minLat: 39.5, maxLat: 39.7, minLng: -89.2, maxLng: -89.0 },
    },
  ];
  await supabaseServer.from("jurisdictions").upsert(jurisdictions);

  // 3. Badges
  const badges = [
    { id: "first_report", label: "First Report", description: "Submitted your first verified report.", icon: "flag" },
    { id: "streak_5", label: "5-Day Streak", description: "Reported activity 5 days in a row.", icon: "flame" },
    { id: "verified_10", label: "Verified 10 Reports", description: "10 AI-verified reports submitted.", icon: "badge-check" },
    { id: "critical_spotter", label: "Critical Issue Spotter", description: "Reported an issue that reached Critical priority.", icon: "siren" },
    { id: "repair_confirmed", label: "Repair Confirmed", description: "One of your reports was resolved.", icon: "check-circle" },
  ];
  await supabaseServer.from("badges").upsert(badges);

  // 4. Rewards
  const rewards = [
    { id: "coffee5", label: "$5 Coffee Voucher", description: "Redeemable at partner cafes (simulated).", point_cost: 100, stock: 50 },
    { id: "transit10", label: "$10 Transit Card Top-up", description: "Simulated public transit credit.", point_cost: 200, stock: 30 },
    { id: "hardware15", label: "$15 Hardware Store Voucher", description: "Simulated home-improvement voucher.", point_cost: 350, stock: 20 },
    { id: "tshirt", label: "CivicRoad AI T-Shirt", description: "Simulated merch reward.", point_cost: 500, stock: 10 },
  ];
  await supabaseServer.from("rewards_catalog").upsert(rewards);

  console.log("✅ Seeding complete.");
}

seed().catch(console.error);
