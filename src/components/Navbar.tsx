import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50 shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-xl rounded-xl"></div>
              <div className="relative bg-gradient-hero p-[3px] rounded-xl shadow-glow">
                <img
                  src="/swap.jpeg"
                  alt="SWAP"
                  className="h-5 w-5 rounded-lg object-cover"
                />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
              SWAP
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="text-foreground/80 hover:text-primary transition-smooth font-medium relative group"
            >
              Accueil
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-hero group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/comment-ca-marche" 
              className="text-foreground/80 hover:text-primary transition-smooth font-medium relative group"
            >
              Comment ça marche
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-hero group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/charte" 
              className="text-foreground/80 hover:text-primary transition-smooth font-medium relative group"
            >
              Charte
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-hero group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/simulateur" 
              className="text-foreground/80 hover:text-primary transition-smooth font-medium relative group"
            >
              Simulateur
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-hero group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Button onClick={() => navigate('/login')} variant="hero" size="default" className="shadow-glow hover:shadow-glow-accent">
              Commencer
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <Link to="/" className="text-foreground hover:text-primary transition-smooth" onClick={() => setIsMenuOpen(false)}>
              Accueil
            </Link>
            <Link to="/comment-ca-marche" className="text-foreground hover:text-primary transition-smooth" onClick={() => setIsMenuOpen(false)}>
              Comment ça marche
            </Link>
            <Link to="/charte" className="text-foreground hover:text-primary transition-smooth" onClick={() => setIsMenuOpen(false)}>
              Charte
            </Link>
            <Link to="/simulateur" className="text-foreground hover:text-primary transition-smooth" onClick={() => setIsMenuOpen(false)}>
              Simulateur
            </Link>
            <Button onClick={() => navigate('/login')} variant="hero" size="default" className="w-full">
              Commencer
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
