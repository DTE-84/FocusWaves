import { supabase } from "./supabase";

async function getAccessToken(): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase auth is not configured yet.");
  }
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Please sign in first.");
  }
  return data.session.access_token;
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }
  return payload as T;
}

export async function apiPost<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }
  return payload as T;
}
