import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BackHomeButton = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => navigate('/')}
        variant="hero"
        size="icon"
        className="h-10 w-10 shadow-glow hover:shadow-glow-accent"
        aria-label="Retour à l'accueil"
        title="Retour à l'accueil"
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BackHomeButton;
