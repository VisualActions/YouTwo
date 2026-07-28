import { createClient } from "@/lib/supabase/server";
import type { Channel } from "@/lib/types";
import CustomizationForm from "./CustomizationForm";

export const dynamic = "force-dynamic";

export default async function CustomizationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Channel customization</h1>
      <p className="mt-1 text-sm text-yt-sub">
        How your channel appears across YouTwo.
      </p>
      <CustomizationForm channel={channel as Channel} />
    </div>
  );
}
