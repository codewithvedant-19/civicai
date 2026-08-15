import { supabaseServer } from "@/lib/supabase";
import type { Jurisdiction, Authority } from "@/domain/types";

export const JurisdictionRepository = {
  async list(): Promise<Jurisdiction[]> {
    const { data } = await supabaseServer.from("jurisdictions").select("*");
    return (data || []).map(j => ({
      id: j.id,
      city: j.city,
      state: j.state,
      country: j.country,
      authorityId: j.authority_id,
      bounds: j.bounds,
    }));
  },

  async findContaining(lat: number, lng: number): Promise<Jurisdiction | undefined> {
    // Basic fallback since bounding box query might require PostGIS. 
    // We fetch all and filter in memory for prototype parity.
    const all = await this.list();
    return all.find(
      (j) =>
        lat >= j.bounds.minLat &&
        lat <= j.bounds.maxLat &&
        lng >= j.bounds.minLng &&
        lng <= j.bounds.maxLng
    );
  },

  async findById(id: string): Promise<Jurisdiction | undefined> {
    const { data } = await supabaseServer.from("jurisdictions").select("*").eq("id", id).maybeSingle();
    return data ? {
      id: data.id,
      city: data.city,
      state: data.state,
      country: data.country,
      authorityId: data.authority_id,
      bounds: data.bounds,
    } : undefined;
  },
};

export const AuthorityRepository = {
  async list(): Promise<Authority[]> {
    const { data } = await supabaseServer.from("authorities").select("*");
    return (data || []).map(a => ({
      id: a.id,
      name: a.name,
      jurisdictionId: a.jurisdiction_id,
      isSimulated: a.is_simulated,
    }));
  },

  async findById(id: string): Promise<Authority | undefined> {
    const { data } = await supabaseServer.from("authorities").select("*").eq("id", id).maybeSingle();
    return data ? {
      id: data.id,
      name: data.name,
      jurisdictionId: data.jurisdiction_id,
      isSimulated: data.is_simulated,
    } : undefined;
  },
};
