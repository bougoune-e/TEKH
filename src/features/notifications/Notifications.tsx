import { useEffect, useState, useCallback } from "react";
import { Bell, Clock, CheckCircle2, XCircle, Megaphone, Sparkles, ArrowLeft, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";

type Campaign = {
  id: string;
  title: string;
  body: string;
  url: string;
  sent_count: number;
  failed_count: number;
  total_subs: number;
  created_at: string;
};

const DISMISSED_KEY = "tekh_dismissed_notifs";

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

function getContentEmoji(title: string, body?: string): string {
  const text = `${title} ${body || ""}`.toLowerCase();
  if (text.includes("charg")) return "🔌";
  if (text.includes("iphone") || text.includes("apple")) return "📱";
  if (text.includes("samsung") || text.includes("galaxy")) return "📱";
  if (text.includes("huawei") || text.includes("xiaomi") || text.includes("oppo") || text.includes("tecno") || text.includes("infinix")) return "📱";
  if (text.includes("batterie")) return "🔋";
  if (text.includes("écran") || text.includes("ecran") || text.includes("screen")) return "🖥️";
  if (text.includes("livraison") || text.includes("livré")) return "🚚";
  if (text.includes("cadeau") || text.includes("gagn")) return "🎁";
  if (text.includes("répar") || text.includes("repair")) return "🔧";
  if (text.includes("promo") || text.includes("réduction") || text.includes("solde")) return "🏷️";
  if (text.includes("deal") || text.includes("offre") || text.includes("bon plan")) return "🔥";
  if (text.includes("nouveau") || text.includes("arrivage")) return "✨";
  if (text.includes("certif") || text.includes("garanti")) return "✅";
  if (text.includes("échange") || text.includes("reprise")) return "🔄";
  if (text.includes("paiement") || text.includes("prix") || text.includes("fcfa")) return "💰";
  if (text.includes("urgent") || text.includes("limité") || text.includes("stock")) return "⚡";
  if (text.includes("annonce")) return "📢";
  return "📣";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [visible, setVisible] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase
      .from("notification_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const all = data ?? [];
        setCampaigns(all);
        const dismissed = getDismissed();
        setVisible(all.filter((c) => !dismissed.has(c.id)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dismiss = useCallback((id: string) => {
    const dismissed = getDismissed();
    dismissed.add(id);
    saveDismissed(dismissed);
    setVisible((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    const dismissed = getDismissed();
    campaigns.forEach((c) => dismissed.add(c.id));
    saveDismissed(dismissed);
    setVisible([]);
  }, [campaigns]);

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Header avec bouton retour */}
        <div className="flex items-center gap-3 py-5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted/80 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-black text-foreground tracking-tight leading-none">
              {t("nav.notifications", "Notifications")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alertes et mises à jour TEKH+
            </p>
          </div>

          {visible.length > 0 && (
            <button
              onClick={dismissAll}
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/40"
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-border/40 bg-card p-10 text-center space-y-3 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-foreground font-bold">Aucune notification</p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
              Vous serez notifié des nouveaux deals, offres et mises à jour.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 px-1 pb-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {visible.length} message{visible.length > 1 ? "s" : ""}
              </span>
            </div>

            {visible.map((c) => {
              const emoji = getContentEmoji(c.title, c.body);
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-card border border-border/40 hover:border-border/70 transition-all group"
                >
                  {/* Emoji */}
                  <div className="shrink-0 w-11 h-11 rounded-2xl bg-muted/50 flex items-center justify-center text-xl">
                    {emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-[14px] text-foreground leading-tight">
                        {c.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {c.body}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {c.sent_count} reçus
                      </span>
                      {c.failed_count > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-500 font-semibold">
                          <XCircle className="w-3 h-3" />
                          {c.failed_count}
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground/50 flex items-center gap-1">
                        <Megaphone className="w-3 h-3" />
                        Admin
                      </span>
                    </div>
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => dismiss(c.id)}
                    className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all mt-0.5"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
