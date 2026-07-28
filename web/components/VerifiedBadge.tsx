import { VerifiedBadge as KitVerifiedBadge } from "@youtwo/ui-kit";

// Thin adapter: callers in this app size the badge with Tailwind classes
// (h-4 w-4, h-5 w-5), which override the kit's width/height attributes.
export default function VerifiedBadge({ className = "" }: { className?: string }) {
  return <KitVerifiedBadge className={`inline-block shrink-0 ${className}`} />;
}
