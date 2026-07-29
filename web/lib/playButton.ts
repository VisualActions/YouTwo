"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlayButtonTier = "silver" | "gold" | "diamond";

/** Subscriber thresholds the awards are modelled on. */
export const TIERS: Record<PlayButtonTier, { label: string; threshold: number }> = {
  silver: { label: "Silver Play Button", threshold: 100 },
  gold: { label: "Gold Play Button", threshold: 1000 },
  diamond: { label: "Diamond Play Button", threshold: 10000 },
};

function generateClaimCode(tier: PlayButtonTier) {
  // Readable in an email and unambiguous when typed at a checkout: no O/0/I/1.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `YT2-${tier.slice(0, 3).toUpperCase()}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

function awardEmail(opts: {
  displayName: string;
  handle: string;
  tierLabel: string;
  code: string;
  note?: string | null;
  siteUrl: string;
}) {
  const { displayName, handle, tierLabel, code, note, siteUrl } = opts;
  return {
    subject: `You've earned the YouTwo ${tierLabel}`,
    text: [
      `Congratulations ${displayName},`,
      ``,
      `Your channel @${handle} has been awarded the YouTwo ${tierLabel}.`,
      ``,
      `Claim it free with this code: ${code}`,
      ``,
      note ? `${note}\n` : ``,
      `The code is single-use and tied to your channel.`,
      `${siteUrl}`,
    ]
      .filter((l) => l !== undefined)
      .join("\n"),
    html: `
<div style="background:#0f0f0f;color:#f1f1f1;font-family:Roboto,Segoe UI,Arial,sans-serif;padding:40px 24px">
  <div style="max-width:520px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px">
      <span style="display:inline-block;width:38px;height:26px;border-radius:9px;background:#ff0033;color:#fff;font-weight:700;text-align:center;line-height:26px">2</span>
      <span style="font-size:20px;font-weight:700;letter-spacing:-1px">YouTwo</span>
    </div>
    <h1 style="font-size:24px;margin:0 0 8px">Congratulations, ${displayName}</h1>
    <p style="color:#aaaaaa;margin:0 0 24px">
      Your channel <strong style="color:#f1f1f1">@${handle}</strong> has earned the
      <strong style="color:#f1f1f1">${tierLabel}</strong>.
    </p>
    <div style="border:1px solid #303030;border-radius:12px;padding:20px;margin-bottom:24px">
      <div style="font-size:12px;color:#aaaaaa;margin-bottom:8px">YOUR FREE CLAIM CODE</div>
      <div style="font-family:ui-monospace,Consolas,monospace;font-size:18px;letter-spacing:1px">${code}</div>
    </div>
    ${note ? `<p style="color:#aaaaaa;margin:0 0 24px">${note}</p>` : ""}
    <p style="color:#aaaaaa;font-size:13px;margin:0">
      The code is single-use and tied to your channel. Redeem it at checkout when the
      YouTwo store opens.
    </p>
    <p style="margin-top:32px"><a href="${siteUrl}" style="color:#3ea6ff">${siteUrl}</a></p>
  </div>
</div>`.trim(),
  };
}

/**
 * Issues a Play Button award and, if an email provider is configured, sends it.
 *
 * Without RESEND_API_KEY the award is still created and the code returned, so
 * the console can show it for manual delivery — the record is the source of
 * truth, the email is a convenience.
 */
export async function issuePlayButton(input: {
  channelId: string;
  tier: PlayButtonTier;
  email: string;
  note?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", code: null, emailed: false };

  const { data: me } = await supabase
    .from("channels")
    .select("handle, is_owner")
    .eq("id", user.id)
    .single();
  if (!me?.is_owner) return { error: "Owner access required.", code: null, emailed: false };

  const admin = createAdminClient();
  if (!admin)
    return {
      error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server.",
      code: null,
      emailed: false,
    };

  const recipient = input.email.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient))
    return { error: "That doesn't look like an email address.", code: null, emailed: false };

  const { data: channel } = await admin
    .from("channels")
    .select("id, handle, display_name")
    .eq("id", input.channelId)
    .single();
  if (!channel) return { error: "Channel not found.", code: null, emailed: false };

  const code = generateClaimCode(input.tier);
  const { data: award, error: insErr } = await admin
    .from("play_button_awards")
    .insert({
      channel_id: channel.id,
      tier: input.tier,
      claim_code: code,
      recipient_email: recipient,
      note: input.note?.trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (insErr) return { error: insErr.message, code: null, emailed: false };

  // Send it, if a provider is wired up.
  let emailed = false;
  let emailError: string | null = null;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PLAY_BUTTON_FROM || "YouTwo <onboarding@resend.dev>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://youtwo-six.vercel.app";

  if (apiKey) {
    const body = awardEmail({
      displayName: channel.display_name,
      handle: channel.handle,
      tierLabel: TIERS[input.tier].label,
      code,
      note: input.note,
      siteUrl,
    });
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [recipient], ...body }),
      });
      if (res.ok) emailed = true;
      else emailError = `${res.status}: ${(await res.text()).slice(0, 300)}`;
    } catch (e) {
      emailError = e instanceof Error ? e.message : "send failed";
    }
  } else {
    emailError = "RESEND_API_KEY not set — award created but not emailed.";
  }

  await admin
    .from("play_button_awards")
    .update({
      emailed_at: emailed ? new Date().toISOString() : null,
      email_error: emailError,
    })
    .eq("id", award.id);

  await admin.from("admin_audit").insert({
    actor_id: user.id,
    actor_handle: me.handle,
    action: "play_button.issue",
    target_channel: channel.id,
    target_handle: channel.handle,
    detail: { tier: input.tier, recipient, emailed },
  });

  revalidatePath("/admin");
  return { error: null, code, emailed, emailError };
}

export async function markAwardClaimed(awardId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { data: me } = await supabase
    .from("channels")
    .select("is_owner")
    .eq("id", user.id)
    .single();
  if (!me?.is_owner) return { error: "Owner access required." };

  const admin = createAdminClient();
  if (!admin) return { error: "Service role key not configured." };
  const { error } = await admin
    .from("play_button_awards")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", awardId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { error: null };
}
