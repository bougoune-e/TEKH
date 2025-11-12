import { Button } from "@/components/ui/button";
import EmptyState from "../components/EmptyState";

const DealBox = () => {
  return (
    <EmptyState
      title="Aucune DealBox"
      description="Crée et gère tes produits reconditionnés une fois l'API branchée."
      action={<Button variant="default">Créer une DealBox</Button>}
    />
  );
};

export default DealBox;
