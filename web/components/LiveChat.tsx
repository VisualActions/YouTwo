"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ChannelAvatar from "./ChannelAvatar";

type ChatMessage = {
  id: string;
  channel_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type SenderInfo = { handle: string; display_name: string; avatar_url: string | null };

export default function LiveChat({
  channelId,
  signedIn,
}: {
  channelId: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [senders, setSenders] = useState<Record<string, SenderInfo>>({});
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    let cancelled = false;

    async function loadSenders(ids: string[]) {
      const missing = Array.from(new Set(ids));
      if (missing.length === 0) return;
      const { data } = await supabase
        .from("channels")
        .select("id, handle, display_name, avatar_url")
        .in("id", missing);
      if (cancelled || !data) return;
      setSenders((prev) => {
        const next = { ...prev };
        for (const c of data) {
          next[c.id] = {
            handle: c.handle,
            display_name: c.display_name,
            avatar_url: c.avatar_url,
          };
        }
        return next;
      });
    }

    (async () => {
      const { data } = await supabase
        .from("live_chat_messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      const initial = (data ?? []).reverse() as ChatMessage[];
      setMessages(initial);
      loadSenders(initial.map((m) => m.sender_id));
    })();

    const sub = supabase
      .channel(`chat:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev.slice(-199), msg]
          );
          loadSenders([msg.sender_id]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(sub);
    };
  }, [channelId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!signedIn) {
      router.push("/login");
      return;
    }
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const supabase = supabaseRef.current;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("live_chat_messages").insert({
        channel_id: channelId,
        sender_id: user.id,
        body: text.slice(0, 500),
      });
      if (!error) setBody("");
    }
    setSending(false);
  }

  return (
    <div className="flex h-[480px] flex-col rounded-xl border border-yt-border xl:h-[calc(100vh-8.5rem)]">
      <div className="border-b border-yt-border px-4 py-3 font-medium">Live chat</div>
      <div ref={listRef} className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2.5">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-yt-sub">
              Say hello — chat starts here.
            </p>
          )}
          {messages.map((m) => {
            const s = senders[m.sender_id];
            return (
              <div key={m.id} className="flex items-start gap-2 text-sm">
                <ChannelAvatar
                  src={s?.avatar_url ?? null}
                  name={s?.display_name ?? "?"}
                  size={24}
                />
                <p className="min-w-0 break-words leading-6">
                  {s ? (
                    <Link
                      href={`/channel/@${s.handle}`}
                      className="mr-2 font-medium text-yt-sub hover:text-yt-text"
                    >
                      {s.display_name}
                    </Link>
                  ) : (
                    <span className="mr-2 font-medium text-yt-sub">…</span>
                  )}
                  {m.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-yt-border p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={500}
          placeholder={signedIn ? "Chat..." : "Sign in to chat"}
          className="h-10 min-w-0 flex-1 rounded-full border border-yt-border bg-[#121212] px-4 text-sm outline-none focus:border-yt-blue"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="h-10 shrink-0 rounded-full bg-yt-blue px-4 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
