import { useEffect, useState } from "react";
import { Bell, Clock, CheckCircle2, XCircle, Megaphone, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
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

/** Retourne un emoji pertinent selon les mots-clés du titre/message */
function getContentEmoji(title: string, body?: string): string {
  const text = `${title} ${body || ""}`.toLowerCase();
  if (text.includes("charg")) return "🔌";
  if (text.includes("iphone") || text.includes("apple")) return "📱";
  if (text.includes("samsung") || text.includes("galaxy")) return "📱";
  if (text.includes("huawei") || text.includes("xiaomi") || text.includes("oppo") || text.includes("tecno") || text.includes("infinix")) return "📱";
  if (text.includes("batterie")) return "🔋";
  if (text.includes("écran") || text.includes("ecran") || text.includes("screen")) return "🖥️";
  if (text.includes("livraison") || text.includes("livré")) return "🚚";
  if (text.includes("cadeau") || text.includes("gagn") || text.includes("gagnant")) return "🎁";
  if (text.includes("répar") || text.includes("repair") || text.includes("service")) return "🔧";
  if (text.includes("promo") || text.includes("réduction") || text.includes("solde") || text.includes("remise")) return "🏷️";
  if (text.includes("deal") || text.includes("offre") || text.includes("bon plan")) return "🔥";
  if (text.includes("nouveau") || text.includes("arrivage") || text.includes("neuf")) return "✨";
  if (text.includes("certif") || text.includes("garanti")) return "✅";
  if (text.includes("échange") || text.includes("troc") || text.includes("reprise")) return "🔄";
  if (text.includes("paiement") || text.includes("prix") || text.includes("fcfa")) return "💰";
  if (text.includes("urgent") || text.includes("limité") || text.includes("stock")) return "⚡";
  return "📣";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase
      .from("notification_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setCampaigns(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">
              {t("nav.notifications", "Notifications")}
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Alertes et mises à jour TEKH+
            </p>
          </div>
          {campaigns.length > 0 && (
            <span className="ml-auto text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {campaigns.length}
            </span>
          )}
        </div>

        {/* States */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-card p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-foreground font-black text-base">Aucune notification</p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Vous serez notifié des nouveaux deals, offres et mises à jour de vos annonces.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Indicateur "tout lu" */}
            <div className="flex items-center gap-2 px-1 pb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Broadcasts TEKH+
              </span>
            </div>

            {campaigns.map((c) => {
              const emoji = getContentEmoji(c.title, c.body);
              return (
                <div
                  key={c.id}
                  className="group relative flex items-start gap-3.5 p-4 rounded-2xl bg-card border border-border/40 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-default"
                >
                  {/* Emoji icon */}
                  <div className="shrink-0 w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center text-xl shadow-sm">
                    {emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-[15px] text-foreground leading-tight tracking-tight">
                        {c.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {c.body}
                    </p>

                    {/* Stats livraison */}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {c.sent_count} reçus
                      </span>
                      {c.failed_count > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
                          <XCircle className="w-3 h-3" />
                          {c.failed_count} échoués
                        </span>
                      )}
                      <span className="ml-auto text-[10px] text-muted-foreground/60">
                        <Megaphone className="w-3 h-3 inline mr-1" />
                        TEKH+ Admin
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
