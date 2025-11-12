import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const BackBar = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 mt-24 mb-4">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1">
        <ChevronLeft className="h-4 w-4" />
        Retour
      </Button>
    </div>
  );
};

export default BackBar;
