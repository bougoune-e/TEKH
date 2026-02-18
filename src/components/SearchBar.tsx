import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState(params.get("q") ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = q.trim();
    navigate(`/search${next ? `?q=${encodeURIComponent(next)}` : ""}`);
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl ml-auto relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 nav-icon text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un deal..."
        className="w-full h-11 sm:h-[45px] rounded-xl pl-12 pr-4 outline-none border border-border bg-white/70 dark:bg-[#252525] supports-[backdrop-filter]:backdrop-blur-sm focus:border-primary transition-smooth"
      />
    </form>
  );
}
