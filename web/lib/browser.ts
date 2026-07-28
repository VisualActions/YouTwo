// Browser helpers that must keep working over plain HTTP.
//
// YouTwo is self-hosted and routinely opened over a LAN address like
// http://192.168.1.10:3000. That is NOT a secure context, so the browser
// withholds crypto.randomUUID() and navigator.clipboard — both of which throw
// or are undefined there. Everything below degrades instead of breaking.

/** RFC 4122 v4 UUID. Uses crypto.randomUUID when the context allows it. */
export function uuid(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === "function") return c.randomUUID();

  // getRandomValues is available in insecure contexts; randomUUID is not.
  if (typeof c?.getRandomValues === "function") {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last resort: not cryptographically strong, but these ids only need to be
  // unique, and the database rejects collisions on the primary key anyway.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Copies text to the clipboard, falling back to a temporary textarea. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
