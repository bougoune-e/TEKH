import { useState, useEffect } from "react";
import { fetchBrands, fetchModels, getAvailableVariants } from "@/core/api/supabaseApi";
import { lookupCsvVariants } from "@/core/api/csvCatalog";
import { calculerEstimation } from "@/core/api/pricing";
import { getPhoneSpecs } from "./phoneSpecs";
import { createClient } from "@supabase/supabase-js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import {
  BadgeCheck, TrendingDown, AlertCircle,
  Cpu, Battery, Monitor, Wifi, Camera, Smartphone,
  Layers, ChevronRight, Zap
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const CONDITIONS = [
  {
    label: "Parfait état",
    desc: "Écran impeccable, batterie ≥ 90%, châssis intact",
    icon: BadgeCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
    diag: { ecran: "parfait" as const, chassis: "intact" as const, batterie: "gte90" as const },
  },
  {
    label: "Bon état",
    desc: "Légères rayures, batterie ≥ 80%, châssis intact",
    icon: TrendingDown,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    diag: { ecran: "raye" as const, chassis: "intact" as const, batterie: "gte80_89" as const },
  },
  {
    label: "État correct",
    desc: "Rayures visibles, batterie ≥ 70%, châssis légèrement abîmé",
    icon: AlertCircle,
    color: "text-orange-500",
    bg: "bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
    diag: { ecran: "raye" as const, chassis: "abime" as const, batterie: "gte70_79" as const },
  },
] as const;

interface DeviceRow {
  prt_fcfa: number;
  annee_sortie: number | null;
  specs: { ram_gb?: number; stockage_gb?: number; "5g"?: boolean; reseau?: string; categorie?: string } | null;
  classe_tekh: string | null;
}

function SpecItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | undefined }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold leading-none mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900 truncate">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function PrixPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState<number | "">("");

  const [device, setDevice] = useState<DeviceRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    if (!brand) return;
    setModel(""); setStorage(""); setDevice(null);
    fetchModels(brand).then(setModels).catch(() => {});
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) return;
    setStorage(""); setDevice(null);
    getAvailableVariants(brand, model)
      .then((v: any[]) => {
        const s = Array.from(new Set((v || []).map((x: any) => x.storage_gb).filter(Boolean))).sort((a, b) => a - b) as number[];
        if (s.length > 0) { setStorages(s); return; }
        // CSV fallback
        const csv = lookupCsvVariants(brand, model);
        setStorages(csv?.storages ?? []);
      })
      .catch(() => {
        const csv = lookupCsvVariants(brand, model);
        setStorages(csv?.storages ?? []);
      });
  }, [brand, model]);

  useEffect(() => {
    if (!brand || !model || storage === "") { setDevice(null); return; }
    setLoading(true);
    supabase
      .from("smartphones")
      .select("prt_fcfa, annee_sortie, specs, classe_tekh")
      .eq("marque", brand)
      .ilike("modele", `%${model}%`)
      .ilike("variante", `%${storage}%`)
      .not("prt_fcfa", "is", null)
      .order("prt_updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setDevice(data as DeviceRow ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [brand, model, storage]);

  const staticSpecs = brand && model ? getPhoneSpecs(brand, model) : {};
  const dbSpecs = device?.specs ?? {};

  // Merge: DB values override static for ram/storage/5g
  const ram = dbSpecs.ram_gb ?? undefined;
  const is5g = dbSpecs["5g"] ?? (staticSpecs.processeur?.toLowerCase().includes("5g") ?? false);
  const reseau = dbSpecs.reseau ?? (is5g ? "5G" : staticSpecs.processeur ? "4G" : undefined);

  const vrtResults = device?.prt_fcfa
    ? CONDITIONS.map((c) => ({
        ...c,
        vrt: calculerEstimation(device.prt_fcfa, brand, device.annee_sortie, c.diag, model),
      }))
    : null;

  const hasSpecs = Object.keys(staticSpecs).length > 0 || ram;
  const ageLabel = device?.annee_sortie ? `${new Date().getFullYear() - device.annee_sortie} an${new Date().getFullYear() - device.annee_sortie > 1 ? "s" : ""}` : null;

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black tracking-tighter">Prix de reprise</h1>
        <p className="text-sm text-slate-500 mt-1">Estimez la valeur de votre smartphone en quelques secondes.</p>
      </div>

      {/* Selectors */}
      <div className="px-4 space-y-2.5">
        {[
          { label: "Marque", value: brand, onChange: setBrand, options: brands, placeholder: "Sélectionner une marque", disabled: false },
          { label: "Modèle", value: model, onChange: setModel, options: models, placeholder: !brand ? "—" : "Sélectionner un modèle", disabled: !brand },
          { label: "Stockage", value: storage ? String(storage) : "", onChange: (v: string) => setStorage(v ? Number(v) : ""), options: storages.map(s => ({ value: String(s), label: s >= 1024 ? `${s / 1024} To` : `${s} Go` })), placeholder: !model ? "—" : "Sélectionner le stockage", disabled: !model || storages.length === 0 },
        ].map(({ label, value, onChange, options, placeholder, disabled }, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</p>
            <Select value={value} onValueChange={onChange as any} disabled={disabled}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 bg-white font-semibold text-sm">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {(options as any[]).map((o) =>
                  typeof o === "string"
                    ? <SelectItem key={o} value={o}>{o}</SelectItem>
                    : <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
        </div>
      )}

      {!loading && storage !== "" && !device && brand && model && (
        <div className="mx-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-sm text-slate-500">Prix non disponible pour cette configuration.</p>
        </div>
      )}

      {!loading && device && (
        <div className="px-4 mt-6 space-y-4">

          {/* ── 1. Identité + Prix de rachat ─────────────────────────────── */}
          <div className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden shadow-sm">

            {/* En-tête identité */}
            <div className="px-4 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{brand}</span>
                  {device.classe_tekh && (
                    <Badge variant="outline" className="text-[10px] font-black px-1.5 py-0 h-4 border-slate-300">Classe {device.classe_tekh}</Badge>
                  )}
                  {reseau && (
                    <Badge className={`text-[10px] font-black px-1.5 py-0 h-4 ${is5g ? "bg-purple-600" : "bg-slate-600"}`}>{reseau}</Badge>
                  )}
                </div>
                <h2 className="text-lg font-black leading-tight">{model}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">{storage} Go</span>
                  {ram && <><span className="text-slate-300">·</span><span className="text-xs text-slate-500 font-medium">{ram} Go RAM</span></>}
                  {device.annee_sortie && <><span className="text-slate-300">·</span><span className="text-xs text-slate-500 font-medium">{device.annee_sortie} {ageLabel && `(${ageLabel})`}</span></>}
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Smartphone className="w-7 h-7 text-slate-300" />
              </div>
            </div>

            {/* Prix de référence */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix de référence (marché occasion)</p>
              <p className="text-3xl font-black mt-1 tracking-tight">{fmt(device.prt_fcfa)}</p>
            </div>

            {/* Prix de reprise selon état */}
            <div className="px-4 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2 pb-1">Prix de reprise TΞKΗ+ selon l'état</p>
              {vrtResults?.map(({ label, desc, icon: Icon, color, bg, dot, vrt }) => (
                <div key={label} className={`rounded-xl border px-4 py-3 mb-2 flex items-center justify-between gap-3 ${bg}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-black leading-tight">{label}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-base font-black ${color}`}>
                      {vrt > 0 ? fmt(vrt) : <span className="text-red-500 text-sm">Refusé</span>}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-slate-400 leading-relaxed pb-3">
                Estimation indicative. Le prix final est confirmé après diagnostic complet par un technicien TΞKΗ+.
              </p>
            </div>
          </div>

          {/* ── 2. Fiche technique ───────────────────────────────────────── */}
          {hasSpecs && (
          <div className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-3 pb-1">Fiche technique</p>
              {staticSpecs.processeur && <SpecItem icon={Cpu} label="Processeur" value={staticSpecs.processeur} />}
              <SpecItem icon={Layers} label="RAM" value={ram ? `${ram} Go` : undefined} />
              <SpecItem icon={Layers} label="Stockage" value={storage ? `${storage} Go` : undefined} />
              {staticSpecs.ecran_pouces && (
                <SpecItem icon={Monitor} label="Écran" value={`${staticSpecs.ecran_pouces}${staticSpecs.ecran_type ? ` · ${staticSpecs.ecran_type}` : ""}`} />
              )}
              {staticSpecs.batterie_mah && (
                <SpecItem icon={Battery} label="Batterie" value={`${staticSpecs.batterie_mah.toLocaleString("fr-FR")} mAh${staticSpecs.charge_w ? ` · Charge ${staticSpecs.charge_w}W` : ""}`} />
              )}
              {staticSpecs.camera_principale && (
                <SpecItem icon={Camera} label="Caméra principale" value={staticSpecs.camera_principale} />
              )}
              {staticSpecs.camera_selfie && (
                <SpecItem icon={Camera} label="Caméra frontale" value={staticSpecs.camera_selfie} />
              )}
              {reseau && (
                <SpecItem icon={Wifi} label="Réseau" value={reseau} />
              )}
              {staticSpecs.sim_slots && (
                <SpecItem icon={Smartphone} label="Slots SIM" value={`Dual SIM (${staticSpecs.sim_slots} nano-SIM)`} />
              )}
              {staticSpecs.os && (
                <SpecItem icon={Zap} label="Système" value={staticSpecs.os} />
              )}
            </div>
          </div>
          )}

        </div>
      )}
    </div>
  );
}
