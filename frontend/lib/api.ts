import { supabase } from "./supabase";

const BASE = process.env.NEXT_PUBLIC_API_URL;

/** True when no backend is configured — pages fall back to seed data so the
 *  product can be demoed on Vercel before the Render backend is live. */
export const DEMO = !BASE;

async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error("API not configured");
  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}
