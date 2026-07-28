"use client";

import { useState, useTransition } from "react";
import { Copy, Eye, EyeOff, RefreshCw, Check } from "lucide-react";
import { regenerateStreamKey } from "@/lib/actions";
import { copyText } from "@/lib/browser";

export default function StreamKeyPanel({
  rtmpUrl,
  streamKey,
}: {
  rtmpUrl: string;
  streamKey: string;
}) {
  const [key, setKey] = useState(streamKey);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<"url" | "key" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function copy(text: string, which: "url" | "key") {
    const ok = await copyText(text);
    if (!ok) {
      setError("Couldn't copy automatically — select the field and copy manually.");
      return;
    }
    setError(null);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  function regenerate() {
    setError(null);
    startTransition(async () => {
      const res = await regenerateStreamKey();
      if (res.error || !res.key) setError(res.error ?? "Failed to regenerate");
      else setKey(res.key);
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-xl border border-yt-border p-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Ingest URL</label>
        <div className="flex items-center gap-2">
          <code className="h-10 flex-1 truncate rounded-lg border border-yt-border bg-[#121212] px-3 leading-10">
            {rtmpUrl}
          </code>
          <IconButton
            onClick={() => copy(rtmpUrl, "url")}
            label="Copy ingest URL"
            icon={copied === "url" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Stream key</label>
        <div className="flex items-center gap-2">
          <code className="h-10 flex-1 truncate rounded-lg border border-yt-border bg-[#121212] px-3 leading-10">
            {revealed ? key : "•".repeat(Math.min(key.length, 40))}
          </code>
          <IconButton
            onClick={() => setRevealed((v) => !v)}
            label={revealed ? "Hide key" : "Reveal key"}
            icon={revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          />
          <IconButton
            onClick={() => copy(key, "key")}
            label="Copy stream key"
            icon={copied === "key" ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          />
        </div>
        <p className="mt-2 text-xs text-yt-sub">
          Keep this secret. Anyone with the key can stream as your channel.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div>
        <button
          onClick={regenerate}
          disabled={pending}
          className="flex h-9 items-center gap-2 rounded-full bg-yt-raised px-4 text-sm font-medium hover:bg-yt-hover disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
          Regenerate key
        </button>
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yt-raised hover:bg-yt-hover"
    >
      {icon}
    </button>
  );
}
