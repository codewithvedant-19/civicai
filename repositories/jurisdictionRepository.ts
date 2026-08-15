import { db } from "@/db";
import { jurisdictions, authorities } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import type { Jurisdiction, Authority } from "@/domain/types";

export const JurisdictionRepository = {
  async list(): Promise<Jurisdiction[]> {
    const rows = await db.select().from(jurisdictions);
    return rows.map(toJurisdiction);
  },

  async findContaining(lat: number, lng: number): Promise<Jurisdiction | undefined> {
    const [row] = await db
      .select()
      .from(jurisdictions)
      .where(
        and(
          lte(jurisdictions.minLat, lat),
          gte(jurisdictions.maxLat, lat),
          lte(jurisdictions.minLng, lng),
          gte(jurisdictions.maxLng, lng)
        )
      );
    return row ? toJurisdiction(row) : undefined;
  },

  async findById(id: string): Promise<Jurisdiction | undefined> {
    const [row] = await db.select().from(jurisdictions).where(eq(jurisdictions.id, id));
    return row ? toJurisdiction(row) : undefined;
  },
};

function toJurisdiction(row: typeof jurisdictions.$inferSelect): Jurisdiction {
  return {
    id: row.id,
    city: row.city,
    state: row.state,
    country: row.country,
    authorityId: row.authorityId,
    bounds: { minLat: row.minLat, maxLat: row.maxLat, minLng: row.minLng, maxLng: row.maxLng },
  };
}

export const AuthorityRepository = {
  async list(): Promise<Authority[]> {
    return (await db.select().from(authorities)) as Authority[];
  },

  async findById(id: string): Promise<Authority | undefined> {
    const [row] = await db.select().from(authorities).where(eq(authorities.id, id));
    return row as Authority | undefined;
  },
};
