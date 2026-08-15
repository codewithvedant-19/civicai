"use client";
import { useEffect, useState } from "react";
import type { PublicUser } from "@/domain/types";
import { apiGet } from "@/lib/apiClient";

export function useCurrentUser() {
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined); // undefined = loading
  const refresh = () => apiGet<{ user: PublicUser | null }>("/api/auth/me").then((d) => setUser(d.user));
  useEffect(() => {
    refresh();
  }, []);
  return { user, loading: user === undefined, refresh };
}
