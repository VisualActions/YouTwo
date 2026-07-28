import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  Palette,
  BarChart3,
  Radio,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { Brand } from "@youtwo/ui-kit";
import Topbar from "@/components/Topbar";
import { createClient } from "@/lib/supabase/server";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/studio");

  return (
    <>
      <Topbar />
      <aside className="fixed bottom-0 left-0 top-14 z-40 hidden w-60 overflow-y-auto border-r border-yt-border px-3 pb-6 pt-4 lg:block">
        <Link href="/studio" className="mb-3 flex items-center gap-2 px-3">
          <Brand label="YouTwo" href="/studio" />
          <span className="text-sm font-medium text-yt-sub">Studio</span>
        </Link>
        <nav className="flex flex-col gap-1">
          <StudioLink href="/studio" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
          <StudioLink href="/studio/content" icon={<Video className="h-5 w-5" />} label="Content" />
          <StudioLink href="/studio/upload" icon={<Upload className="h-5 w-5" />} label="Upload" />
          <StudioLink href="/studio/analytics" icon={<BarChart3 className="h-5 w-5" />} label="Analytics" />
          <StudioLink href="/studio/stream" icon={<Radio className="h-5 w-5" />} label="Stream settings" />
          <StudioLink href="/studio/customization" icon={<Palette className="h-5 w-5" />} label="Customization" />
        </nav>
        <hr className="my-4 border-yt-border" />
        <StudioLink href="/" icon={<ArrowLeft className="h-5 w-5" />} label="Back to YouTwo" />
      </aside>
      <main className="pt-14 lg:pl-60">
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}

function StudioLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg px-3 py-2 text-sm hover:bg-yt-raised"
    >
      {icon}
      {label}
    </Link>
  );
}
