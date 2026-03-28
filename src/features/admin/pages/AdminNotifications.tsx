import { useState, useEffect } from "react";
import { Bell, Send, Users, CheckCircle2, XCircle, Clock, Smartphone, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
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
  sent_by: string | null;
  created_at: string;
};

function getApiUrl(): string {
  const env = (import.meta.env.VITE_API_URL as string || "").trim().replace(/\/$/, "");
  if (!env) return "";
  return /^https?:\/\//i.test(env) ? env : `https://${env}`;
}
const API_URL = getApiUrl();

/** Emoji intelligent basé sur les mots-clés du titre/message */
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
  if (text.includes("annonce")) return "📢";
  return "📣";
}

/** Suggestions d'emojis pour le titre en cours de saisie */
function getTitlePreviewEmoji(title: string): string {
  if (!title.trim()) return "📣";
  return getContentEmoji(title);
}

async function fetchSubCountFromSupabase(): Promise<number | null> {
  const { data, error } = await supabase.rpc("count_push_subscriptions");
  if (error) { console.error("[push/count] RPC Supabase:", error.message); return null; }
  return typeof data === "number" ? data : Number(data ?? 0);
}

async function fetchSubCountFromBackend(jwt: string): Promise<number | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/push/count`, { headers: { Authorization: `Bearer ${jwt}` } });
    if (!res.ok) { console.error("[push/count] Backend HTTP", res.status); return null; }
    const json = await res.json();
    return typeof json.count === "number" ? json.count : null;
  } catch (e: any) {
    console.error("[push/count] Backend réseau:", e.message);
    return null;
  }
}

type Subscriber = {
  id: string;
  created_at: string;
  user_agent: string | null;
  endpoint_short: string;
  profile: { id: string; full_name?: string; avatar_url?: string } | null;
};

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/deals");
  const [sending, setSending] = useState(false);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoadingHistory(false); return; }
    loadData();
  }, []);

  async function loadData(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    else setLoadingHistory(true);

    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;

    const [count, subsRes, { data: camp }] = await Promise.all([
      fetchSubCountFromSupabase().then(async (n) => {
        if (n !== null) return n;
        if (!jwt) return 0;
        const nb = await fetchSubCountFromBackend(jwt);
        return nb ?? 0;
      }),
      jwt
        ? fetch(`${API_URL}/api/push/subscribers`, { headers: { Authorization: `Bearer ${jwt}` } })
            .then(r => r.ok ? r.json() : { subscribers: [] })
            .catch(() => ({ subscribers: [] }))
        : Promise.resolve({ subscribers: [] }),
      supabase
        .from("notification_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setSubCount(count);
    setSubscribers(subsRes.subscribers ?? []);
    setCampaigns(camp ?? []);
    setLoadingHistory(false);
    setRefreshing(false);
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.error("Titre et message sont obligatoires");
      return;
    }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      if (!jwt) throw new Error("Session expirée");

      const res = await fetch(`${API_URL}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");

      toast.success(`${getContentEmoji(title)} Envoyé à ${json.sent} abonné(s) sur ${json.total}`);
      setTitle("");
      setBody("");
      setUrl("/deals");
      await loadData(true);
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setSending(false);
    }
  }

  const previewEmoji = getTitlePreviewEmoji(title);
  const successRate = campaigns.length > 0
    ? Math.round((campaigns.reduce((a, c) => a + c.sent_count, 0) / Math.max(1, campaigns.reduce((a, c) => a + c.total_subs, 0))) * 100)
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">🔔 Notifications Push</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envoie une notification à tous les utilisateurs abonnés.
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <div className="text-2xl font-black text-foreground">{subCount === null ? "—" : subCount}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Abonnés</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
          <div className="text-2xl font-black text-foreground">{campaigns.length}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Campagnes</div>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center">
          <div className="text-2xl font-black text-foreground">{successRate !== null ? `${successRate}%` : "—"}</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Taux livraison</div>
        </div>
      </div>

      {/* Liste abonnés */}
      {subscribers.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-sm font-black">Appareils abonnés</span>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{subscribers.length}</span>
          </div>
          {subscribers.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 text-xs">
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary shrink-0">
                {(s.profile?.full_name || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {s.profile?.full_name || s.profile?.id?.slice(0, 8) || "Anonyme"}
                </div>
                <div className="text-muted-foreground truncate">{s.user_agent?.split(" ").slice(-2).join(" ")}</div>
              </div>
              <div className="text-muted-foreground/60 shrink-0 text-[10px]">
                {new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire composer */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm font-black">Composer une notification</span>
          {title && (
            <span className="ml-auto text-2xl leading-none" title="Emoji auto-détecté">
              {previewEmoji}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Titre *
          </label>
          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nouveau deal disponible !"
              maxLength={80}
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {title && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                {previewEmoji}
              </span>
            )}
          </div>
          <div className="text-right text-[10px] text-muted-foreground">{title.length}/80</div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Message *
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Découvrez les meilleures offres du moment..."
            maxLength={200}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div className="text-right text-[10px] text-muted-foreground">{body.length}/200</div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            URL de destination
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/deals"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Preview */}
        {title && body && (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Aperçu</p>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground leading-tight">
                  {previewEmoji} {title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body}</p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="w-full gap-2 font-black"
        >
          <Send className="h-4 w-4" />
          {sending ? "Envoi en cours..." : `${previewEmoji} Envoyer à ${subCount ?? "?"} abonné(s)`}
        </Button>
      </div>

      {/* Historique */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-black">Historique des campagnes</h2>
          {campaigns.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{campaigns.length}</span>
          )}
        </div>

        {loadingHistory ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-sm text-muted-foreground p-6 rounded-2xl border border-dashed border-border text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Aucune notification envoyée pour l'instant
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const emoji = getContentEmoji(c.title, c.body);
              const rate = c.total_subs > 0 ? Math.round((c.sent_count / c.total_subs) * 100) : 100;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border/50 bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Emoji badge */}
                    <div className="w-10 h-10 rounded-2xl bg-muted/60 flex items-center justify-center text-xl shrink-0 shadow-sm">
                      {emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-black text-[14px] text-foreground leading-tight">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(c.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.body}</p>

                      {/* Stats bar */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            {c.sent_count} livrés
                          </span>
                          {c.failed_count > 0 && (
                            <span className="flex items-center gap-1 text-rose-500 font-bold">
                              <XCircle className="h-3 w-3" />
                              {c.failed_count} échoués
                            </span>
                          )}
                          <span className="text-muted-foreground ml-auto">
                            <Users className="h-3 w-3 inline mr-0.5" />
                            {c.total_subs} abonnés · {rate}%
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
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
