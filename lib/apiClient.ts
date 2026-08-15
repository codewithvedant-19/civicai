export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

export async function apiPost<T = any>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

export async function apiPatch<T = any>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}
