import Table from "../components/Table";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { Button } from "@/components/ui/button";

type User = {
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

const Users = () => {
  const data: User[] = [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Utilisateurs</h2>
        <div className="flex gap-2">
          <Button variant="outline" disabled>Exporter CSV</Button>
        </div>
      </div>
      <Table<User>
        columns={[
          { key: "name", header: "Nom" },
          { key: "email", header: "Email" },
          { key: "role", header: "Rôle" },
          { key: "status", header: "Statut" },
          { key: "createdAt", header: "Inscription" },
          {
            key: "actions",
            header: "Actions",
            render: () => (
              <div className="flex gap-2">
                <ConfirmDialog title="Suspendre l'utilisateur" description="L'utilisateur ne pourra plus se connecter." onConfirm={async () => {}}>
                  <Button variant="outline" size="sm" disabled>Suspendre</Button>
                </ConfirmDialog>
                <ConfirmDialog title="Changer le rôle" description="Attribuer les permissions admin." onConfirm={async () => {}}>
                  <Button variant="outline" size="sm" disabled>Rôle</Button>
                </ConfirmDialog>
                <ConfirmDialog title="Supprimer l'utilisateur" description="Action irréversible." onConfirm={async () => {}}>
                  <Button variant="destructive" size="sm" disabled>Supprimer</Button>
                </ConfirmDialog>
              </div>
            ),
          },
        ]}
        data={data}
        empty={<EmptyState title="Aucun utilisateur" description="Branche l'API pour lister et gérer les utilisateurs." />}
      />
    </div>
  );
};

export default Users;
