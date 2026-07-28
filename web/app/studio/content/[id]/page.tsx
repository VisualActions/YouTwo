import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";
import EditVideoForm from "./EditVideoForm";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", params.id)
    .eq("channel_id", user.id)
    .single();
  if (!video) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Video details</h1>
      <EditVideoForm video={video as Video} />
    </div>
  );
}
