import { useEffect, useState, useCallback } from "react";
import {
  Bell, Clock, ArrowLeft, Trash2, X, MessageCircle, ChevronRight
} from "lucide-react";
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

const DISMISSED_KEY = "tekh_dismissed_notifs";
function getDismissed(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]")); }
  catch { return new Set(); }
}
function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

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

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return "À l'instant";
  if (d < 3600) return `${Math.floor(d / 60)}min`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  if (d < 604800) return `${Math.floor(d / 86400)}j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Feuille de détail (bottom sheet) ──────────────────────────
function DetailSheet({
  c, onClose, onDismiss,
}: { c: Campaign; onClose: () => void; onDismiss: (id: string) => void }) {
  const emoji = getEmoji(c.title, c.body);

  const handleWhatsApp = () => {
    const msg = `Bonjour TEKH+ 👋\nJe suis intéressé(e) par votre offre :\n*${c.title}*\n\n${c.body}\n\nPouvez-vous m'en dire plus ?`;
    const opened = openWhatsApp(msg);
    if (!opened) window.open("https://wa.me/22891000000", "_blank");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border/50 shadow-2xl max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-200">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Header sheet */}
          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-2xl shrink-0">
                {emoji}
              </div>
              <div className="min-w-0">
                <p className="font-black text-[15px] text-foreground leading-tight">{c.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{fullDate(c.created_at)}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Corps complet */}
          <div className="rounded-2xl bg-muted/30 border border-border/30 p-4">
            <p className="text-sm text-foreground leading-relaxed">{c.body}</p>
          </div>

          {/* Bouton WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2.5 bg-[#064e3b] dark:bg-[#059669] hover:opacity-90 active:scale-[0.98] text-white font-black text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
          >
            <MessageCircle className="w-5 h-5" />
            Contacter TEKH+ sur WhatsApp
          </button>

          {/* Supprimer */}
          <button
            onClick={() => { onDismiss(c.id); onClose(); }}
            className="w-full text-center text-[12px] text-muted-foreground hover:text-rose-500 font-semibold py-1 transition-colors"
          >
            Supprimer cette notification
          </button>
        </div>
      </div>
    </>
  );
}

// ── Page principale ────────────────────────────────────────────
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
        const dismissed = getDismissed();
        setVisible(all.filter((c) => !dismissed.has(c.id)));
      })
      .finally(() => setLoading(false));
  }, []);

  const dismiss = useCallback((id: string) => {
    const d = getDismissed(); d.add(id); saveDismissed(d);
    setVisible((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    const d = getDismissed();
    campaigns.forEach((c) => d.add(c.id));
    saveDismissed(d);
    setVisible([]);
  }, [campaigns]);

  // Back button robuste : évite de sortir de l'app
  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="min-h-dvh bg-background pb-28 pt-safe">
      {/* ── Header compact ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center gap-2.5 px-4 h-12">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2.5} />
          </button>

          <div className="flex-1">
            <h1 className="text-[15px] font-black text-foreground tracking-tight">
              {t("nav.notifications", "Notifications")}
            </h1>
          </div>

          {visible.length > 0 && (
            <>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {visible.length}
              </span>
              <button
                onClick={dismissAll}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Tout lire
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-lg mx-auto px-4 pt-3">
        {loading ? (
          <div className="space-y-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[60px] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">Tout est à jour</p>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Vous serez notifié des nouveaux deals et offres.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {visible.map((c) => {
              const emoji = getEmoji(c.title, c.body);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-card border border-border/30 hover:border-border/60 hover:bg-muted/20 active:scale-[0.99] transition-all text-left group"
                >
                  {/* Emoji compact */}
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-base">
                    {emoji}
                  </div>

                  {/* Texte */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-foreground leading-tight truncate">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {c.body}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(c.created_at)}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
              );
            })}

            {/* Action globale bas de page */}
            <button
              onClick={dismissAll}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-[11px] font-semibold text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Effacer toutes les notifications
            </button>
          </div>
        )}
      </div>

      {/* ── Detail sheet ── */}
      {selected && (
        <DetailSheet
          c={selected}
          onClose={() => setSelected(null)}
          onDismiss={dismiss}
        />
      )}
    </div>
  );
}
