import { useEffect, useState, useCallback } from "react";
import { Bell, ArrowLeft, Trash2, ExternalLink, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { openWhatsApp } from "@/core/utils/whatsapp";

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

/* ── localStorage helpers ── */
const KEY = "tekh_dismissed_notifs";
const getDismissed = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); }
  catch { return new Set(); }
};
const saveDismissed = (s: Set<string>) =>
  localStorage.setItem(KEY, JSON.stringify([...s]));

/* ── Emoji par mot-clé ── */
function getEmoji(title: string, body = ""): string {
  const t = `${title} ${body}`.toLowerCase();
  if (t.includes("charg")) return "🔌";
  if (t.includes("iphone") || t.includes("apple")) return "📱";
  if (t.includes("samsung") || t.includes("galaxy")) return "📱";
  if (t.includes("batterie")) return "🔋";
  if (t.includes("écran") || t.includes("ecran")) return "🖥️";
  if (t.includes("livraison")) return "🚚";
  if (t.includes("cadeau") || t.includes("gagn")) return "🎁";
  if (t.includes("répar") || t.includes("repair")) return "🔧";
  if (t.includes("promo") || t.includes("réduction") || t.includes("solde")) return "🏷️";
  if (t.includes("deal") || t.includes("offre") || t.includes("bon plan")) return "🔥";
  if (t.includes("nouveau") || t.includes("arrivage")) return "✨";
  if (t.includes("échange") || t.includes("reprise")) return "🔄";
  if (t.includes("fcfa") || t.includes("prix")) return "💰";
  if (t.includes("urgent") || t.includes("limité")) return "⚡";
  return "📣";
}

/* ── Formatage date ── */
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "À l'instant";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ═══════════════════════════════════════════════════════════════
   VUE DÉTAIL — pleine page, image hero + CTA fixe en bas
═══════════════════════════════════════════════════════════════ */
function DetailView({
  c, onBack, onDismiss,
}: { c: Campaign; onBack: () => void; onDismiss: (id: string) => void }) {
  const emoji = getEmoji(c.title, c.body);

  const handleWhatsApp = () => {
    const msg = `Bonjour TEKH+ 👋\nJe suis intéressé(e) par votre offre :\n*${c.title}*\n\n${c.body}\n\nPouvez-vous m'en dire plus ?`;
    if (!openWhatsApp(msg)) window.open("https://wa.me", "_blank");
  };

  const handleLink = () => {
    if (c.url && c.url !== "/deals") window.location.assign(c.url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border/30 shrink-0 bg-background">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <span className="text-[15px] font-black tracking-tight">Détails</span>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto pb-36">
        {/* Hero card — grand emoji sur fond dégradé */}
        <div className="mx-4 mt-4 rounded-3xl overflow-hidden bg-gradient-to-br from-[#064e3b] to-[#052e16] flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-6xl drop-shadow-lg">{emoji}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400/60 mt-1">
            TEKH+ Notification
          </span>
        </div>

        {/* Date */}
        <div className="px-5 mt-4">
          <p className="text-[11px] text-muted-foreground font-medium">
            {fullDate(c.created_at)}
          </p>
        </div>

        {/* Titre + corps */}
        <div className="px-5 mt-2 space-y-3">
          <h1 className="text-xl font-black text-foreground leading-snug tracking-tight">
            {c.title}
          </h1>
          <p className="text-[15px] text-foreground/80 leading-relaxed font-medium">
            {c.body}
          </p>
        </div>

        {/* Supprimer */}
        <button
          onClick={() => { onDismiss(c.id); onBack(); }}
          className="flex items-center gap-1.5 mx-5 mt-6 text-[12px] text-muted-foreground hover:text-rose-500 transition-colors font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer cette notification
        </button>
      </div>

      {/* ── CTA fixe en bas, AU-DESSUS de la nav bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/20 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+72px)] space-y-2 z-50">
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2.5 bg-[#064e3b] dark:bg-[#059669] text-white font-black text-[15px] py-4 rounded-2xl active:scale-[0.98] transition-all shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          Contacter TEKH+ sur WhatsApp
        </button>
        {c.url && c.url !== "/" && (
          <button
            onClick={handleLink}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-muted-foreground py-2"
          >
            <ExternalLink className="w-4 h-4" />
            Suivre le lien
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE LISTE — groupée par date, vignettes, compact
═══════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [visible, setVisible] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Campaign | null>(null);

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
        const d = getDismissed();
        setVisible(all.filter((c: Campaign) => !d.has(c.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  const dismiss = useCallback((id: string) => {
    const d = getDismissed(); d.add(id); saveDismissed(d);
    setVisible((p) => p.filter((c) => c.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    const d = getDismissed();
    campaigns.forEach((c) => d.add(c.id));
    saveDismissed(d);
    setVisible([]);
  }, [campaigns]);

  const handleBack = () => navigate("/");

  /* Grouper par date */
  const groups: { label: string; items: Campaign[] }[] = [];
  visible.forEach((c) => {
    const label = dateLabel(c.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(c);
    else groups.push({ label, items: [c] });
  });

  /* Détail pleine page */
  if (selected) {
    return (
      <DetailView
        c={selected}
        onBack={() => setSelected(null)}
        onDismiss={dismiss}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-28 pt-safe">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center gap-3 px-4 h-12">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <h1 className="flex-1 text-[17px] font-black tracking-tight">
            {t("nav.notifications", "Notifications")}
          </h1>
          {visible.length > 0 && (
            <button
              onClick={dismissAll}
              className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Tout lire
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Loading */}
        {loading && (
          <div className="space-y-px pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-11 h-11 rounded-2xl bg-muted/50 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded bg-muted/50 animate-pulse w-3/4" />
                  <div className="h-2.5 rounded bg-muted/40 animate-pulse w-1/2" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-muted/40 animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-3xl bg-muted/40 flex items-center justify-center">
              <Bell className="w-6 h-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">Tout est à jour</p>
            <p className="text-xs text-muted-foreground text-center max-w-[180px] leading-relaxed">
              Vos alertes deals et offres apparaîtront ici.
            </p>
          </div>
        )}

        {/* Liste groupée */}
        {!loading && groups.map((group) => (
          <div key={group.label}>
            {/* En-tête de groupe */}
            <div className="px-4 pt-4 pb-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-border/20">
              {group.items.map((c) => {
                const emoji = getEmoji(c.title, c.body);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 active:bg-muted/30 transition-colors text-left"
                  >
                    {/* Vignette emoji — style logo app */}
                    <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#052e16] flex items-center justify-center text-xl shadow-sm">
                      {emoji}
                    </div>

                    {/* Texte */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] text-foreground leading-tight line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                        {c.body}
                      </p>
                    </div>

                    {/* Heure + miniature */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                        {timeAgo(c.created_at)}
                      </span>
                      {/* Miniature colorée (placeholder visuel) */}
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
                        {emoji}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Effacer tout */}
        {!loading && visible.length > 0 && (
          <button
            onClick={dismissAll}
            className="w-full flex items-center justify-center gap-2 py-4 mt-2 text-[12px] font-medium text-muted-foreground/60 hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Effacer toutes les notifications
          </button>
        )}
      </div>
    </div>
  );
}
