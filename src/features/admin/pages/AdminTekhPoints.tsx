import { useEffect, useState } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { fetchAllProfiles } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { Coins, Plus, RefreshCw, X, Info } from "lucide-react";

const TEKH_POINT_VALUE = 500; // 1 TekhPoint = 500 FCFA

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type CreditRow = {
  id: string;
  user_id: string;
  amount_fcfa: number;
  issued_at: string;
  expires_at: string;
  status: string;
  metadata: Record<string, unknown>;
};

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}
function pts(fcfa: number) {
  return Math.floor(fcfa / TEKH_POINT_VALUE);
}

export default function AdminTekhPoints() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [credits, setCredits] = useState<CreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reliquatFcfa, setReliquatFcfa] = useState<number | "">("");
  const [motif, setMotif] = useState("Downgrade swap");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileList, { data: creditData }] = await Promise.all([
        fetchAllProfiles(),
        supabase!.from("tekh_point_credits")
          .select("*")
          .order("issued_at", { ascending: false })
          .limit(100),
      ]);
      setProfiles(profileList || []);
      setCredits(creditData || []);
    } catch (e: any) {
      toast.error("Erreur de chargement : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedUserId) { toast.error("Sélectionnez un utilisateur."); return; }
    if (!reliquatFcfa || reliquatFcfa <= 0) { toast.error("Entrez un reliquat valide."); return; }
    if (reliquatFcfa <= 15000) { toast.error("Le reliquat doit être > 15 000 FCFA pour générer des TekhPoints."); return; }

    const points = pts(reliquatFcfa);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    setSubmitting(true);
    try {
      const { error } = await supabase!.from("tekh_point_credits").insert({
        user_id: selectedUserId,
        amount_fcfa: reliquatFcfa,
        expires_at: expiresAt.toISOString(),
        status: "active",
        metadata: {
          motif,
          points_computed: points,
          credited_by_admin: true,
          credited_at: new Date().toISOString(),
        },
      });
      if (error) throw error;
      const profile = profiles.find(p => p.id === selectedUserId);
      toast.success(`${points} TekhPoints crédités à ${profile?.full_name || "l'utilisateur"} (${fmt(reliquatFcfa)})`);
      setShowForm(false);
      setSelectedUserId("");
      setReliquatFcfa("");
      setMotif("Downgrade swap");
      loadData();
    } catch (e: any) {
      toast.error("Erreur : " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase!.from("tekh_point_credits").update({ status: "cancelled" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Crédit annulé.");
    loadData();
  };

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

  // Aggregate balance per user
  const balanceByUser = credits
    .filter(c => c.status === "active" && new Date(c.expires_at) > new Date())
    .reduce<Record<string, number>>((acc, c) => {
      acc[c.user_id] = (acc[c.user_id] || 0) + c.amount_fcfa;
      return acc;
    }, {});

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            TekhPoints
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Créditer des points après une transaction physique · 1 pt = {fmt(TEKH_POINT_VALUE)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Créditer des points
          </Button>
        </div>
      </div>

      {/* Info box */}
      <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Les TekhPoints sont crédités lorsqu'un utilisateur reçoit un appareil moins cher que la valeur de reprise de son téléphone (downgrade).
          Le reliquat au-delà de <strong>15 000 FCFA</strong> est converti en points (1 pt = {fmt(TEKH_POINT_VALUE)}).
          Valables <strong>6 mois</strong>, utilisables jusqu'à <strong>30%</strong> d'une transaction.
        </p>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-black mb-1 flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" /> Créditer des TekhPoints
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              À utiliser après une transaction physique validée.
            </p>

            <div className="space-y-4">
              {/* User search + select */}
              <div className="space-y-1.5">
                <Label>Utilisateur</Label>
                <Input
                  placeholder="Rechercher par nom ou ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="mb-1.5"
                />
                <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredProfiles.length === 0 && (
                    <div className="py-4 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé</div>
                  )}
                  {filteredProfiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedUserId(p.id); setSearch(p.full_name || p.id); }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-3 hover:bg-muted transition-colors border-b last:border-0 ${selectedUserId === p.id ? "bg-primary/10 text-primary font-semibold" : ""}`}
                    >
                      {p.avatar_url
                        ? <img src={p.avatar_url} className="w-7 h-7 rounded-full object-cover shrink-0" alt="" />
                        : <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">{(p.full_name || "?")[0]?.toUpperCase()}</div>
                      }
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{p.full_name || "Sans nom"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.id}</p>
                      </div>
                      {balanceByUser[p.id] ? (
                        <Badge variant="secondary" className="ml-auto shrink-0 text-amber-700 bg-amber-100">
                          {pts(balanceByUser[p.id])} pts
                        </Badge>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reliquat */}
              <div className="space-y-1.5">
                <Label>Reliquat à créditer (FCFA)</Label>
                <Input
                  type="number"
                  min={0}
                  value={reliquatFcfa as any}
                  onChange={e => setReliquatFcfa(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ex : 30000"
                />
                {reliquatFcfa !== "" && reliquatFcfa > 15000 && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    = <strong>{pts(reliquatFcfa)} TekhPoints</strong> ({fmt(pts(reliquatFcfa) * TEKH_POINT_VALUE)})
                  </p>
                )}
                {reliquatFcfa !== "" && reliquatFcfa <= 15000 && reliquatFcfa > 0 && (
                  <p className="text-xs text-orange-500">Reliquat ≤ 15 000 FCFA : absorbé par TEKH+, pas de points.</p>
                )}
              </div>

              {/* Motif */}
              <div className="space-y-1.5">
                <Label>Motif</Label>
                <Input
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  placeholder="Ex : Downgrade swap iPhone 13 → Tecno Camon 30"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black"
                onClick={handleSubmit}
                disabled={submitting || !selectedUserId || !reliquatFcfa || reliquatFcfa <= 15000}
              >
                {submitting ? "Crédit en cours…" : `Créditer ${reliquatFcfa && reliquatFcfa > 15000 ? pts(reliquatFcfa) + " pts" : ""}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Balances par utilisateur */}
      {Object.keys(balanceByUser).length > 0 && (
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Soldes actifs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(balanceByUser).map(([uid, fcfa]) => {
              const p = profileMap[uid];
              return (
                <div key={uid} className="rounded-xl border bg-card p-3 flex items-center gap-3">
                  {p?.avatar_url
                    ? <img src={p.avatar_url} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
                    : <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center font-black text-amber-700">{(p?.full_name || "?")[0]?.toUpperCase()}</div>
                  }
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{p?.full_name || "—"}</p>
                    <p className="text-base font-black text-amber-600">{pts(fcfa)} pts</p>
                    <p className="text-[10px] text-muted-foreground">{fmt(fcfa)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historique complet */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">Historique des crédits</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm animate-pulse">Chargement…</div>
        ) : credits.length === 0 ? (
          <div className="text-center py-12 border rounded-xl text-muted-foreground text-sm">
            Aucun crédit TekhPoints pour le moment.
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Utilisateur</th>
                  <th className="text-right px-4 py-3">Points</th>
                  <th className="text-right px-4 py-3">FCFA</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Motif</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Expire</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {credits.map(c => {
                  const p = profileMap[c.user_id];
                  const expired = new Date(c.expires_at) < new Date();
                  const statusLabel = expired && c.status === "active" ? "expired" : c.status;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p?.avatar_url
                            ? <img src={p.avatar_url} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
                            : <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">{(p?.full_name || "?")[0]?.toUpperCase()}</div>
                          }
                          <span className="font-medium truncate max-w-[120px]">{p?.full_name || c.user_id.slice(0, 8) + "…"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-amber-600">{pts(c.amount_fcfa)} pts</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{fmt(c.amount_fcfa)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground truncate max-w-[160px]">
                        {(c.metadata?.motif as string) || "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {new Date(c.expires_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={statusLabel === "active" ? "default" : "secondary"}
                          className={
                            statusLabel === "active" ? "bg-emerald-100 text-emerald-700 border-0" :
                            statusLabel === "expired" ? "bg-slate-100 text-slate-500 border-0" :
                            statusLabel === "cancelled" ? "bg-red-100 text-red-600 border-0" :
                            "bg-blue-100 text-blue-700 border-0"
                          }
                        >
                          {statusLabel === "active" ? "Actif" :
                           statusLabel === "expired" ? "Expiré" :
                           statusLabel === "cancelled" ? "Annulé" : "Utilisé"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "active" && !expired && (
                          <button
                            onClick={() => handleCancel(c.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Annuler ce crédit"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
