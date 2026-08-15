"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import type { Notification } from "@/domain/types";

export default function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => apiGet<{ notifications: Notification[] }>("/api/notifications").then((d) => active && setItems(d.notifications));
    load();
    const id = setInterval(load, 4000); // simple polling stand-in for Supabase Realtime
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [userId]);

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-lg p-2 text-ink-muted hover:text-ink">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-asphalt-line bg-asphalt-surface p-2 shadow-xl">
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="p-3 text-sm text-ink-muted">No notifications yet.</p>}
            {items.slice(0, 15).map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  apiPatch("/api/notifications", { id: n.id });
                  setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)));
                }}
                className={`block w-full rounded-lg p-2.5 text-left text-sm hover:bg-asphalt ${n.read ? "text-ink-muted" : "text-ink"}`}
              >
                {n.message}
                <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{new Date(n.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
