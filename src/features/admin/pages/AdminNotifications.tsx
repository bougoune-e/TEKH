import { useState, useEffect } from "react";
import { Bell, Send, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
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

const API_URL = (import.meta.env.VITE_API_URL as string || "").replace(/\/$/, "");

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/deals");
  const [sending, setSending] = useState(false);
  const [subCount, setSubCount] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoadingHistory(false); return; }
    loadData();
  }, []);

  async function loadData() {
    setLoadingHistory(true);
    const [{ count }, { data: camp }] = await Promise.all([
      supabase.from("push_subscriptions").select("*", { count: "exact", head: true }),
      supabase
        .from("notification_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setSubCount(count ?? 0);
    setCampaigns(camp ?? []);
    setLoadingHistory(false);
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), url }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur serveur");

      toast.success(`Envoyé à ${json.sent} abonné(s) sur ${json.total}`);
      setTitle("");
      setBody("");
      setUrl("/deals");
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-black tracking-tight">Notifications Push</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Envoie une notification à tous les utilisateurs abonnés.
        </p>
      </div>

      {/* Stat abonnés */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl font-black text-foreground">
            {subCount === null ? "—" : subCount}
          </div>
          <div className="text-xs text-muted-foreground font-medium">abonné(s) aux notifications</div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm font-black">Composer une notification</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Titre *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nouveau deal disponible !"
            maxLength={80}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
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

        <Button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="w-full gap-2 font-black"
        >
          <Send className="h-4 w-4" />
          {sending ? "Envoi en cours..." : `Envoyer à ${subCount ?? "?"} abonné(s)`}
        </Button>
      </div>

      {/* Historique */}
      <div>
        <h2 className="text-sm font-black mb-3">Historique des envois</h2>
        {loadingHistory ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 rounded-2xl border border-dashed border-border text-center">
            Aucune notification envoyée pour l'instant
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border/50 bg-card p-4 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm leading-tight">{c.title}</div>
                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(c.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{c.body}</div>
                <div className="flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {c.sent_count} envoyés
                  </span>
                  {c.failed_count > 0 && (
                    <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                      <XCircle className="h-3.5 w-3.5" />
                      {c.failed_count} échoués
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {c.total_subs} abonnés au moment de l'envoi
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
