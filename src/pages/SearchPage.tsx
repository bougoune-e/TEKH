import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDeals } from "@/context/DealsContext";
import PhoneCard from "@/components/PhoneCard";
import MasonryGrid from "@/components/ui/MasonryGrid";
import { Input } from "@/components/ui/input";
import { Sparkles, Search } from "lucide-react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { deals } = useDeals();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const filteredDeals = useMemo(() => {
    if (!query) return deals;
    const s = query.toLowerCase();
    return deals.filter(d =>
      `${d.brand} ${d.model} ${d.description}`.toLowerCase().includes(s)
    );
  }, [deals, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-6 text-center">
          Trouvez votre <span className="text-primary">Match</span>
        </h1>
        <form onSubmit={handleSearch} className="relative group">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="iPhone 13, Samsung S23, 256 Go..."
            className="h-16 pl-14 pr-6 rounded-full bg-card border-2 border-border/40 focus:border-primary/50 text-lg shadow-xl transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </form>
      </div>

      {filteredDeals.length > 0 ? (
        <MasonryGrid>
          {filteredDeals.map((deal) => (
            <PhoneCard
              key={deal.id}
              {...deal}
              image={deal.images?.[0]}
            />
          ))}
        </MasonryGrid>
      ) : (
        <div className="text-center py-20 opacity-50">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold">Aucun résultat pour "{query}"</h2>
          <p>Essayez une autre recherche ou explorez les deals récents.</p>
        </div>
      )}
    </div>
  );
}
