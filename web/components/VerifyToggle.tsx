"use client";

import { useState, useTransition } from "react";
import { BadgeCheck } from "lucide-react";
import { setVerified } from "@/lib/actions";

export default function VerifyToggle({
  channelId,
  verified,
}: {
  channelId: string;
  verified: boolean;
}) {
  const [isVerified, setIsVerified] = useState(verified);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isVerified;
    setIsVerified(next);
    startTransition(async () => {
      const res = await setVerified(channelId, next);
      if (res?.error) setIsVerified(!next);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium ${
        isVerified
          ? "bg-yt-blue/15 text-yt-blue hover:bg-yt-blue/25"
          : "bg-yt-raised text-yt-sub hover:bg-yt-hover"
      }`}
    >
      <BadgeCheck className="h-4 w-4" />
      {isVerified ? "Verified" : "Verify"}
    </button>
  );
}
