import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Channel } from "./supabase";

/** Current auth session, kept in sync with Supabase's auth state changes. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

/** The signed-in user's own channel row. */
export function useMyChannel(session: Session | null) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!session?.user) {
      setChannel(null);
      return;
    }
    supabase
      .from("channels")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setChannel((data as Channel) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return channel;
}
