"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { subscribe, unsubscribe } from "@/lib/actions";

type Props = {
  channelId: string;
  initialSubscribed: boolean;
  signedIn: boolean;
};

export default function SubscribeButton({ channelId, initialSubscribed, signedIn }: Props) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    const next = !subscribed;
    setSubscribed(next);
    startTransition(async () => {
      const res = next ? await subscribe(channelId) : await unsubscribe(channelId);
      if (res?.error) setSubscribed(!next);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={
        subscribed
          ? "rounded-full bg-yt-raised px-4 h-9 text-sm font-medium hover:bg-yt-hover"
          : "rounded-full bg-yt-text text-black px-4 h-9 text-sm font-medium hover:bg-white/80"
      }
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
