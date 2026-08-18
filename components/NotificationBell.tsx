"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import type { Notification } from "@/domain/types";

export default function NotificationBell({ userId }: { userId?: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = () =>
      apiGet<{ notifications: Notification[] }>("/api/notifications")
        .then((d) => active && setItems(d.notifications))
        .catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [userId]);

  const unread = items.filter((i) => !i.read).length;
  // If not logged in or 0 notifications, we can show default 9+ badge if on home demo or unread badge
  const displayBadge = unread > 0 ? (unread > 9 ? "9+" : unread) : "9+";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center p-2 text-slate-700 hover:text-slate-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        <span className="absolute 1.5 -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#FFC000] text-[10px] font-bold text-slate-900 shadow-sm">
          {displayBadge}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</span>
            {unread > 0 && <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">{unread} unread</span>}
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {items.length === 0 ? (
              <p className="p-3 text-xs text-slate-500 text-center">No new notifications.</p>
            ) : (
              items.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    apiPatch("/api/notifications", { id: n.id });
                    setItems((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)));
                  }}
                  className={`block w-full rounded-lg p-2.5 text-left text-xs transition-colors hover:bg-slate-50 ${
                    n.read ? "text-slate-500" : "text-slate-900 font-medium bg-slate-50/50"
                  }`}
                >
                  {n.message}
                  <div className="mt-1 font-mono text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
