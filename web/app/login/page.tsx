"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@youtwo/ui-kit";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        router.push(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) {
          setError(error.message);
          return;
        }
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setNotice("Check your email for a confirmation link, then sign in.");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-yt-surface p-8">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>

        <h1 className="text-center text-xl font-medium">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mb-6 mt-1 text-center text-sm text-yt-sub">
          {mode === "signin" ? "to continue to YouTwo" : "you'll get a channel too"}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-lg border border-yt-border bg-[#121212] px-3 outline-none focus:border-yt-blue"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-green-400">{notice}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-full bg-yt-blue font-medium text-black hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Working..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-yt-sub">
          <hr className="flex-1 border-yt-border" /> or <hr className="flex-1 border-yt-border" />
        </div>

        <button
          onClick={google}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-yt-border font-medium hover:bg-yt-raised"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-yt-sub">
          {mode === "signin" ? "New to YouTwo?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="font-medium text-yt-blue"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
