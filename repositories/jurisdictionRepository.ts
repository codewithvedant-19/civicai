import { getDb } from "@/lib/db";
import type { Jurisdiction, Authority } from "@/domain/types";

export const JurisdictionRepository = {
  async list(): Promise<Jurisdiction[]> {
    const db = await getDb();
    return db.data.jurisdictions;
  },

  async findContaining(lat: number, lng: number): Promise<Jurisdiction | undefined> {
    const db = await getDb();
    return db.data.jurisdictions.find(
      (j) =>
        lat >= j.bounds.minLat &&
        lat <= j.bounds.maxLat &&
        lng >= j.bounds.minLng &&
        lng <= j.bounds.maxLng
    );
  },

  async findById(id: string): Promise<Jurisdiction | undefined> {
    const db = await getDb();
    return db.data.jurisdictions.find((j) => j.id === id);
  },
};

export const AuthorityRepository = {
  async list(): Promise<Authority[]> {
    const db = await getDb();
    return db.data.authorities;
  },

  async findById(id: string): Promise<Authority | undefined> {
    const db = await getDb();
    return db.data.authorities.find((a) => a.id === id);
  },
};
