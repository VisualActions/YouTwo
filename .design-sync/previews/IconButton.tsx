import { IconButton } from "@youtwo/ui-kit";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Search() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.34-4.34" />
    </svg>
  );
}

function Upload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function Copy() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...stroke} aria-hidden>
      <rect x="8" y="8" width="14" height="14" rx="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function RoundTopbarActions() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <IconButton icon={<Search />} label="Search" />
      <IconButton icon={<Upload />} label="Upload video" />
    </div>
  );
}

export function BoxedStudioActions() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <IconButton shape="boxed" icon={<Copy />} label="Copy stream key" />
      <IconButton shape="boxed" icon={<Copy />} label="Copy ingest URL" />
    </div>
  );
}
