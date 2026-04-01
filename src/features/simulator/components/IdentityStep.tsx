import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Smartphone } from "lucide-react";

interface IdentityStepProps {
    brand: string;
    setBrand: (v: string) => void;
    brands: string[];
    loadingBrands: boolean;
    model: string;
    setModel: (v: string) => void;
    models: string[];
    loadingModels: boolean;
    storage: number | null;
    setStorage: (v: number | null) => void;
    storages: number[];
    loadingStorages: boolean;
    ram: number | null;
    setRam: (v: number | null) => void;
    rams: number[];
}

export const IdentityStep = ({
    brand, setBrand, brands, loadingBrands,
    model, setModel, models, loadingModels,
    storage, setStorage, storages, loadingStorages,
    ram, setRam, rams
}: IdentityStepProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-primary/10 text-blue-600 dark:text-primary flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-xl font-black tracking-tighter uppercase font-sans text-black dark:text-white">1. Identité de l'appareil</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Marque</Label>
                    <Select value={brand || ""} onValueChange={(v) => { setBrand(v); setModel(""); setStorage(null); setRam(null); }}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white hover:border-blue-600/50 dark:hover:border-primary/50 transition-all outline-none">
                            <SelectValue placeholder={loadingBrands ? "..." : "SÉLECTIONNER MARQUE"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">Modèle</Label>
                    <Select value={model || ""} onValueChange={(v) => { setModel(v); setStorage(null); setRam(null); }} disabled={!brand || loadingModels}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                            <SelectValue placeholder={!brand ? "—" : loadingModels ? "..." : "SÉLECTIONNER MODÈLE"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2 ml-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">Stockage</Label>
                        {storages.length === 0 && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Saisie manuelle
                            </span>
                        )}
                    </div>
                    {storages.length > 0 ? (
                        <Select value={storage ? String(storage) : ""} onValueChange={(v) => { setStorage(Number(v)); setRam(null); }} disabled={!model || loadingStorages}>
                            <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                                <SelectValue placeholder={!model ? "—" : loadingStorages ? "..." : "CAPACITÉ (GO)"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                                {storages.map((s) => <SelectItem key={s} value={String(s)}>{s} Go</SelectItem>)}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            type="number"
                            min={1}
                            step={1}
                            value={storage ?? ""}
                            onChange={(e) => {
                                const n = Number(e.target.value);
                                setStorage(Number.isFinite(n) && n > 0 ? n : null);
                                setRam(null);
                            }}
                            disabled={!model || loadingStorages}
                            placeholder={!model ? "—" : "Saisir stockage (Go)"}
                            className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30"
                        />
                    )}
                </div>

                <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 ml-1">RAM</Label>
                    <Select value={ram ? String(ram) : ""} onValueChange={(v) => setRam(Number(v))} disabled={!storage}>
                        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-black text-slate-900 dark:text-white disabled:opacity-30">
                            <SelectValue placeholder={!storage ? "—" : "RAM (GO)"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl bg-white dark:bg-[#0b0e14] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            {(rams.length > 0 ? rams : [4, 6, 8, 12]).map((x) => (
                                <SelectItem key={x} value={String(x)}>{x} Go</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
