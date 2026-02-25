import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllDealsForAdmin, updateDeal, deleteDealById } from "@/core/api/supabaseApi";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import type { DealPost, DealStatus } from "@/shared/data/dealsData";
import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Plus, Pencil, Trash2, Send, Archive } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

const statusLabel: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

export default function AdminDeals() {
  const [deals, setDeals] = useState<DealPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAllDealsForAdmin()
      .then(setDeals)
      .catch(() => toast.error("Erreur chargement deals"))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const setStatus = async (id: string, status: DealStatus) => {
    try {
      await updateDeal(id, { status });
      toast.success(status === "published" ? "Deal publié" : "Deal archivé");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDealById(id);
      toast.success("Deal supprimé");
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Erreur");
    }
  };

  const columns = [
    { key: "title", header: "Titre" },
    { key: "brand", header: "Marque" },
    { key: "model", header: "Modèle" },
    {
      key: "price",
      header: "Prix",
      render: (row: DealPost) => `${(row.price || 0).toLocaleString()} FCFA`,
    },
    {
      key: "status",
      header: "Statut",
      render: (row: DealPost) => (
        <Badge variant={row.status === "published" ? "default" : "secondary"}>
          {statusLabel[row.status || "draft"] || row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: DealPost) => (
        <div className="flex items-center gap-2">
          {row.status === "draft" && (
            <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "published")}>
              <Send className="h-3 w-3 mr-1" /> Publier
            </Button>
          )}
          {row.status === "published" && (
            <Button size="sm" variant="outline" onClick={() => setStatus(row.id, "archived")}>
              <Archive className="h-3 w-3 mr-1" /> Archiver
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link to={`/admin/deals/${row.id}/edit`}><Pencil className="h-3 w-3" /></Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="text-muted-foreground">Chargement des deals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals</h1>
        <Button asChild className="bg-[#064e3b] hover:bg-[#065f46]">
          <Link to="/admin/deals/new"><Plus className="h-4 w-4 mr-2" /> Nouveau deal</Link>
        </Button>
      </div>
      {deals.length === 0 ? (
        <EmptyState
          title="Aucun deal"
          description="Créez un deal pour qu'il apparaisse dans l'app (brouillon puis publier)."
          action={<Button asChild><Link to="/admin/deals/new">Créer un deal</Link></Button>}
        />
      ) : (
        <Table columns={columns} data={deals} empty="Aucun deal" />
      )}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer ce deal ?"
        description="Cette action est irréversible."
        onConfirm={() => deleteId && remove(deleteId)}
      />
    </div>
  );
}
