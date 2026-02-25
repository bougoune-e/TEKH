import { useNavigate } from "react-router-dom";
import { useCart } from "@/features/marketplace/cart.context";
import { Button } from "@/shared/ui/button";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";

export default function Panier() {
  const { items, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-black text-foreground tracking-tight mb-2 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-[#064e3b]" />
          Mon panier
        </h1>
        <p className="text-muted-foreground font-medium text-sm mb-6">
          {items.length} article{items.length !== 1 ? "s" : ""}
        </p>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-foreground font-bold">Votre panier est vide</p>
            <p className="text-muted-foreground text-sm mt-2 mb-6">
              Parcourez les deals et ajoutez des articles pour les retrouver ici.
            </p>
            <Button
              onClick={() => navigate("/deals")}
              className="bg-[#064e3b] hover:bg-[#065f46] text-white rounded-xl font-bold"
            >
              Explorer les deals
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-8">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  {item.image ? (
                    <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-muted" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {item.brand} {item.model}
                    </p>
                    {item.price != null && (
                      <p className="text-sm font-black text-[#064e3b]">
                        {item.price.toLocaleString()} FCFA
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-rose-500 hover:bg-rose-500/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/deals")}
                variant="outline"
                className="w-full rounded-xl font-bold border-2"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continuer mes achats
              </Button>
              <Button
                onClick={clearCart}
                variant="ghost"
                className="w-full rounded-xl font-bold text-rose-500 hover:bg-rose-500/10"
              >
                Vider le panier
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
