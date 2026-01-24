
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/admin/components/EmptyState";
import Table from "@/admin/components/Table";
import { DealboxForm } from "@/admin/components/DealboxForm";
import { fetchDealboxes } from "@/lib/supabaseApi";
import { RefreshCw } from "lucide-react";

const DealBox = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchDealboxes();
    setData(res || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { key: "modele", header: "Modèle", className: "font-semibold" },
    { key: "stockage", header: "Stockage", render: (row: any) => `${row.stockage} Go` },
    {
      key: "type_box", header: "Type", render: (row: any) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${row.type_box === 'KING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.type_box}
        </span>
      )
    },
    { key: "prix_dealbox", header: "Prix", render: (row: any) => `${row.prix_dealbox.toLocaleString()} FCFA` },
    {
      key: "status", header: "Statut", render: (row: any) => (
        <span className={`capitalize ${row.status === 'available' ? 'text-green-600' : 'text-red-500'}`}>
          {row.status === 'available' ? 'Disponible' : row.status}
        </span>
      )
    },
    { key: "created_at", header: "Ajouté le", render: (row: any) => new Date(row.created_at).toLocaleDateString() },
  ];

  if (loading && data.length === 0) {
    return <div className="p-8 text-center">Chargement des dealboxes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Dealboxes</h1>
          <p className="text-muted-foreground">Gérez le stock de produits reconditionnés certifiés.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DealboxForm onSuccess={loadData} />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-1">
        <Table
          columns={columns}
          data={data}
          empty={
            <EmptyState
              title="Aucune Dealbox"
              description="Le stock est vide. Ajoutez votre première Dealbox."
              action={<DealboxForm onSuccess={loadData} />}
            />
          }
        />
      </div>
    </div>
  );
};

export default DealBox;
