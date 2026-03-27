import { useEffect, useState, useMemo } from "react";
import { fetchAllProfiles, fetchAllDealsForAdmin, deleteProfile } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Trash2, Download } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  annonceCount?: number;
};

function exportCSV(profiles: Profile[]) {
  const headers = ["ID", "Nom", "Annonces", "Dernière activité"];
  const rows = profiles.map((p) => [
    p.id,
    p.full_name || "Anonyme",
    String(p.annonceCount ?? 0),
    p.updated_at ? new Date(p.updated_at).toLocaleDateString("fr-FR") : "—",
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tekh_users_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const Users = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([fetchAllProfiles(), fetchAllDealsForAdmin()])
      .then(([profsResult, annoncesResult]) => {
        if (profsResult.status === "rejected") {
          toast.error("Erreur chargement utilisateurs");
        }
        const profs = profsResult.status === "fulfilled" ? profsResult.value : [];
        const annonces = annoncesResult.status === "fulfilled" ? annoncesResult.value : [];
        const countMap: Record<string, number> = {};
        for (const a of annonces) {
          const oid = (a as any).ownerId;
          if (oid) countMap[oid] = (countMap[oid] || 0) + 1;
        }
        setProfiles(profs.map((p: any) => ({ ...p, annonceCount: countMap[p.id] || 0 })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    try {
      await deleteProfile(id);
      toast.success("Profil supprimé");
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter((p) =>
      (p.full_name || "").toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const columns = [
    {
      key: "full_name",
      header: "Utilisateur",
      render: (row: Profile) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img src={row.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {(row.full_name || "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium">{row.full_name || <span className="italic text-muted-foreground">Anonyme</span>}</div>
            <div className="text-xs text-muted-foreground font-mono">{row.id.slice(0, 8)}…</div>
          </div>
        </div>
      ),
    },
    {
      key: "annonceCount",
      header: "Annonces",
      render: (row: Profile) => (
        <Badge variant={row.annonceCount ? "default" : "secondary"}>
          {row.annonceCount ?? 0}
        </Badge>
      ),
    },
    {
      key: "updated_at",
      header: "Dernière activité",
      render: (row: Profile) => (
        <span className="text-sm text-muted-foreground">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString("fr-FR") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Profile) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          title="Supprimer le profil"
          onClick={() => setDeleteId(row.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {profiles.length} profil{profiles.length !== 1 ? "s" : ""} enregistré{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={profiles.length === 0}
          onClick={() => exportCSV(filtered)}
        >
          <Download className="h-4 w-4 mr-2" /> Exporter CSV
        </Button>
      </div>

      <input
        type="search"
        placeholder="Rechercher par nom ou ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
        <strong>Note :</strong> La suppression retire uniquement le profil (données publiques). Pour supprimer le compte Auth, une Edge Function Supabase avec la <code>service_role</code> key est nécessaire.
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm">Chargement des utilisateurs…</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Aucun utilisateur" description="Les profils créés via l'app apparaîtront ici." />
      ) : (
        <Table columns={columns} data={filtered} empty="Aucun utilisateur" />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer ce profil ?"
        description="Les données publiques du profil seront supprimées. Le compte Auth reste actif."
        confirmLabel="Supprimer le profil"
        onConfirm={() => deleteId && remove(deleteId)}
      />
    </div>
  );
};

export default Users;
