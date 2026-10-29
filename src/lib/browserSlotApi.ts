// Shiorivia Cloud save slots: browser-only storage adapter (Phase 0).
// Data stays on this browser origin; clearing site data deletes these slots.
const PREFIX = "shiorivia_cloud_slot_v1_";

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function browserSlotRequest(path: string, options: RequestInit = {}): Promise<Response> {
  const method = String(options.method || "GET").toUpperCase();
  try {
    if (path === "/api/local/slots" && method === "GET") {
      const slots: unknown[] = [];
      for (let i = 0; i < 12; i++) {
        const raw = localStorage.getItem(PREFIX + i);
        if (!raw) continue;
        try {
          const slot = JSON.parse(raw);
          if (slot?.meta) slots.push(slot.meta);
        } catch { /* corrupt entry: ignore */ }
      }
      return response({ slots });
    }

    const body = options.body ? JSON.parse(String(options.body)) : {};
    const index = Number(body.slotIndex);
    if (!Number.isInteger(index) || index < 0 || index >= 12) {
      return response({ error: "Invalid slot index" }, 400);
    }
    const key = PREFIX + index;

    if (path === "/api/local/slots/read" && method === "POST") {
      const raw = localStorage.getItem(key);
      if (!raw) return response({ error: "Slot empty" }, 404);
      try {
        const slot = JSON.parse(raw);
        return slot?.sessionSnapshot ? response({ session: slot.sessionSnapshot }) : response({ error: "Corrupt slot" }, 422);
      } catch { return response({ error: "Corrupt slot" }, 422); }
    }
    if (path === "/api/local/slots" && method === "DELETE") {
      localStorage.removeItem(key);
      return response({ success: true });
    }
    if (path === "/api/local/slots" && method === "POST") {
      if (!body.session) return response({ error: "Missing session" }, 400);
      const meta = { ...body.meta, slotIndex: index, thumbnail: body.thumbnailBase64 || null, timestamp: Date.now() };
      const data = { meta, sessionSnapshot: body.session };
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // Large screenshots can fill localStorage; retry with metadata and session only.
        data.meta.thumbnail = null;
        localStorage.setItem(key, JSON.stringify(data));
      }
      return response({ success: true });
    }
    return response({ error: "Unsupported browser slot operation" }, 400);
  } catch (error) {
    console.error("Browser slot storage unavailable", error);
    return response({ error: "Browser storage unavailable or full" }, 507);
  }
}
