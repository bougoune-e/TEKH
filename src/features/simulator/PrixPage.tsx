import { useState, useEffect } from "react";
import { fetchBrands, fetchModels, getAvailableVariants } from "@/core/api/supabaseApi";
import { calculerEstimation } from "@/core/api/pricing";
import { createClient } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { TrendingDown, BadgeCheck, AlertCircle } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const CONDITIONS = [
  {
    label: "Parfait état",
    icon: BadgeCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    diag: { ecran: "parfait" as const, chassis: "intact" as const, batterie: "gte90" as const },
  },
  {
    label: "Bon état",
    icon: TrendingDown,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    diag: { ecran: "raye" as const, chassis: "intact" as const, batterie: "gte80_89" as const },
  },
  {
    label: "État moyen",
    icon: AlertCircle,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    diag: { ecran: "raye" as const, chassis: "abime" as const, batterie: "gte70_79" as const },
  },
] as const;

export default function PrixPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState<number | "">("");

  const [prt, setPrt] = useState<number | null>(null);
  const [annee, setAnnee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    if (!brand) return;
    setModel("");
    setStorage("");
    setPrt(null);
    fetchModels(brand).then(setModels).catch(() => {});
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) return;
    setStorage("");
    setPrt(null);
    getAvailableVariants(brand, model)
      .then((v: any[]) => {
        const s = Array.from(
          new Set((v || []).map((x: any) => x.storage_gb).filter(Boolean))
        ).sort((a, b) => a - b) as number[];
        setStorages(s);
      })
      .catch(() => setStorages([]));
  }, [brand, model]);

  useEffect(() => {
    if (!brand || !model || storage === "") {
      setPrt(null);
      setAnnee(null);
      return;
    }
    setLoading(true);
    const variantStr = `${storage}GB`;
    supabase
      .from("smartphones")
      .select("prt_fcfa, annee_sortie")
      .eq("marque", brand)
      .ilike("modele", `%${model}%`)
      .ilike("variante", `%${storage}%`)
      .not("prt_fcfa", "is", null)
      .order("prt_updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setPrt(data?.prt_fcfa ?? null);
        setAnnee(data?.annee_sortie ?? null);
      })
      .finally(() => setLoading(false));
  }, [brand, model, storage]);

  const vrtResults = prt
    ? CONDITIONS.map((c) => ({
        ...c,
        vrt: calculerEstimation(prt, brand, annee, c.diag, model),
      }))
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tighter uppercase">Estimation prix</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionnez un appareil pour voir son prix de rachat estimé.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Marque</Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="h-11 rounded-xl border-2">
              <SelectValue placeholder="Sélectionner une marque" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modèle</Label>
          <Select value={model} onValueChange={setModel} disabled={!brand}>
            <SelectTrigger className="h-11 rounded-xl border-2">
              <SelectValue placeholder={!brand ? "—" : "Sélectionner un modèle"} />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stockage</Label>
          <Select
            value={storage ? String(storage) : ""}
            onValueChange={(v) => setStorage(v ? Number(v) : "")}
            disabled={!model || storages.length === 0}
          >
            <SelectTrigger className="h-11 rounded-xl border-2">
              <SelectValue placeholder={!model ? "—" : "Sélectionner le stockage"} />
            </SelectTrigger>
            <SelectContent>
              {storages.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s >= 1024 ? `${s / 1024} To` : `${s} Go`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground text-center py-4">Chargement...</p>
      )}

      {!loading && storage !== "" && prt === null && brand && model && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Prix non disponible pour cette configuration.
        </p>
      )}

      {!loading && prt !== null && vrtResults && (
        <div className="space-y-3">
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Prix de référence (PRT)</p>
            <p className="text-3xl font-black mt-1">{fmt(prt)}</p>
          </div>

          <p className="text-xs text-muted-foreground text-center">Prix de rachat estimé selon l'état :</p>

          <div className="grid gap-2">
            {vrtResults.map(({ label, icon: Icon, color, bg, vrt }) => (
              <Card key={label} className={`border ${bg}`}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                  <span className={`text-base font-black ${color}`}>
                    {vrt > 0 ? fmt(vrt) : "Refusé"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Estimation indicative. Le prix final est déterminé lors du diagnostic complet.
          </p>
        </div>
      )}
    </div>
  );
}
