"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button, Input, MetricLabel } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!supabase) { router.push("/dashboard"); return; }   // demo mode
    setBusy(true);
    const fn = mode === "in"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error } = await fn;
    setBusy(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
  };

  return (
    <main className="hero-grid flex min-h-screen items-center justify-center px-6">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
            <Eye size={15} strokeWidth={2.4} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Argus</span>
        </div>
        <h1 className="mt-6 text-lg font-semibold tracking-tight">
          {mode === "in" ? "Sign in to your workspace" : "Create your workspace"}
        </h1>
        {!supabase && (
          <p className="mt-1 text-[12.5px] text-muted">
            Supabase isn't configured yet — continue straight into the demo workspace.
          </p>
        )}
        <div className="mt-5 space-y-3">
          <Input type="email" placeholder="work@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-[12.5px] text-fail">{error}</p>}
          <Button className="w-full" onClick={submit} disabled={busy}>
            {busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
          </Button>
        </div>
        <button
          className="mt-4 text-[12.5px] text-muted hover:text-ink"
          onClick={() => setMode(m => (m === "in" ? "up" : "in"))}
        >
          {mode === "in" ? "New here? Create an account" : "Already registered? Sign in"}
        </button>
        <div className="mt-6 border-t border-line pt-4">
          <Link href="/"><MetricLabel>← Back to argus.dev</MetricLabel></Link>
        </div>
      </div>
    </main>
  );
}
