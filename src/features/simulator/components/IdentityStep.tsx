import { CheckCircle2, Database, MemoryStick, Search, Smartphone } from "lucide-react";
import { cn } from "@/core/api/utils";
import { useTranslation } from "react-i18next";

const STORAGE_OPTIONS = [16, 32, 64, 128, 256, 512, 1024];

type BrandStyle = { mark: string; tone: string; domain?: string; simpleIcon?: string };

// Keep this registry in sync with the estimator catalogue. The Simple Icons URL
// makes logos available immediately; Brandfetch supersedes it when configured.
const BRAND_STYLES: Record<string, BrandStyle> = {
  apple: { mark: "A", tone: "bg-zinc-950 text-white", domain: "apple.com", simpleIcon: "apple" },
  samsung: { mark: "S", tone: "bg-[#1428A0] text-white", domain: "samsung.com", simpleIcon: "samsung" },
  google: { mark: "G", tone: "bg-white text-[#4285F4]", domain: "google.com", simpleIcon: "google" },
  "google pixel": { mark: "G", tone: "bg-white text-[#4285F4]", domain: "google.com", simpleIcon: "google" },
  huawei: { mark: "H", tone: "bg-[#C7000B] text-white", domain: "huawei.com", simpleIcon: "huawei" },
  honor: { mark: "H", tone: "bg-[#2563EB] text-white", domain: "honor.com", simpleIcon: "honor" },
  infinix: { mark: "I", tone: "bg-[#1A1A1A] text-[#4ADE80]", domain: "infinixmobility.com", simpleIcon: "infinix" },
  itel: { mark: "i", tone: "bg-[#E50046] text-white", domain: "itel-mobile.com", simpleIcon: "itel" },
  nothing: { mark: "N", tone: "bg-black text-white", domain: "nothing.tech", simpleIcon: "nothing" },
  motorola: { mark: "M", tone: "bg-[#E1140A] text-white", domain: "motorola.com", simpleIcon: "motorola" },
  oneplus: { mark: "1+", tone: "bg-[#EB0028] text-white", domain: "oneplus.com", simpleIcon: "oneplus" },
  oppo: { mark: "O", tone: "bg-[#0B7A44] text-white", domain: "oppo.com", simpleIcon: "oppo" },
  realme: { mark: "R", tone: "bg-[#FFCB05] text-black", domain: "realme.com", simpleIcon: "realme" },
  vivo: { mark: "V", tone: "bg-[#415FFF] text-white", domain: "vivo.com", simpleIcon: "vivo" },
  xiaomi: { mark: "MI", tone: "bg-[#FF6900] text-white", domain: "mi.com", simpleIcon: "xiaomi" },
  redmi: { mark: "R", tone: "bg-[#FF6900] text-white", domain: "mi.com", simpleIcon: "xiaomi" },
  poco: { mark: "PO", tone: "bg-[#FFE500] text-black", domain: "po.co", simpleIcon: "poco" },
  tecno: { mark: "T", tone: "bg-[#1677FF] text-white", domain: "tecno-mobile.com", simpleIcon: "tecno" },
  sony: { mark: "S", tone: "bg-black text-white", domain: "sony.com", simpleIcon: "sony" },
  asus: { mark: "A", tone: "bg-[#00539B] text-white", domain: "asus.com", simpleIcon: "asus" },
  lg: { mark: "LG", tone: "bg-[#A50034] text-white", domain: "lg.com", simpleIcon: "lg" },
  lenovo: { mark: "L", tone: "bg-[#E2231A] text-white", domain: "lenovo.com", simpleIcon: "lenovo" },
  "red magic": { mark: "RM", tone: "bg-[#E60012] text-white", domain: "redmagic.gg", simpleIcon: "nubia" },
  zte: { mark: "Z", tone: "bg-[#0A60B0] text-white", domain: "zte.com.cn", simpleIcon: "zte" },
};

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

const brandfetchClientId = import.meta.env.VITE_BRANDFETCH_CLIENT_ID;
const brandLogoUrl = (domain?: string) => domain && brandfetchClientId
  ? "https://cdn.brandfetch.io/domain/" + domain + "/icon.png?c=" + encodeURIComponent(brandfetchClientId)
  : null;
const simpleIconUrl = (slug?: string) => slug ? `https://cdn.simpleicons.org/${slug}` : null;
const faviconUrl = (domain?: string) => domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : null;
const getBrandStyle = (brandName: string): BrandStyle => BRAND_STYLES[brandName.trim().toLowerCase()] ?? {
  mark: brandName.slice(0, 2).toUpperCase(),
  tone: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-white",
};
const formatCapacity = (value: number) => value >= 1024 ? `${value / 1024} To` : `${value} Go`;

export const IdentityStep = ({
  brand, setBrand, brands, loadingBrands,
  model, setModel, models, loadingModels,
  storage, setStorage, storages, loadingStorages,
  ram, setRam, rams,
}: IdentityStepProps) => {
  const { t } = useTranslation();
  const availableBrands = brands.length > 0 ? brands : ["Apple", "Samsung", "Tecno", "Infinix", "Xiaomi", "Huawei", "Oppo", "Vivo"];
  const availableStorages = storages.length > 0 ? storages : STORAGE_OPTIONS;
  const availableRams = rams.length > 0 ? rams : [4, 6, 8, 12];
  const selectBrand = (nextBrand: string) => {
    setBrand(nextBrand);
    setModel("");
    setStorage(null);
    setRam(null);
  };
  const selectModel = (nextModel: string) => {
    setModel(nextModel);
    setStorage(null);
    setRam(null);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[hsl(var(--tekh-green))]/15 bg-white p-5 shadow-[0_20px_50px_-34px_rgba(13,92,61,0.45)] dark:bg-zinc-950 sm:p-8">
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[hsl(var(--tekh-green))]/10 blur-3xl" aria-hidden="true" />
      <div className="relative space-y-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--tekh-green))] text-white shadow-lg shadow-emerald-950/20">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--tekh-green))]">{t("simulator.identity.eyebrow")}</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--tekh-navy))] dark:text-white sm:text-3xl">{t("simulator.identity.title")}</h1>
            <p className="mt-1 text-sm font-medium text-[hsl(var(--tekh-navy))]/60 dark:text-zinc-400">{t("simulator.identity.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[hsl(var(--tekh-navy))] dark:text-white">{t("simulator.identity.brandQuestion")}</p>
            {brand && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--tekh-green))]"><CheckCircle2 className="h-4 w-4" /> {t("simulator.identity.selected")}</span>}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {availableBrands.map((item) => {
              const style = getBrandStyle(item);
              const brandfetchLogo = brandLogoUrl(style.domain);
              const simpleIconLogo = simpleIconUrl(style.simpleIcon);
              const domainFavicon = faviconUrl(style.domain);
              const primaryLogo = brandfetchLogo ?? simpleIconLogo ?? domainFavicon;
              const fallbackLogo = brandfetchLogo ? simpleIconLogo ?? domainFavicon : simpleIconLogo ? domainFavicon : null;
              const selected = brand === item;
              return (
                <button key={item} type="button" onClick={() => selectBrand(item)} className={cn(
                  "group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--tekh-green))]",
                  selected ? "border-[hsl(var(--tekh-green))] bg-[hsl(var(--tekh-green))]/10 shadow-md shadow-emerald-950/10" : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-[hsl(var(--tekh-green))]/45 hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
                )}>
                  <span className={cn("relative flex h-10 min-w-10 items-center justify-center overflow-hidden rounded-xl px-2 text-xs font-bold tracking-tight", style.tone)}>
                    <span aria-hidden={Boolean(primaryLogo)}>{style.mark}</span>
                    {primaryLogo && (
                      <img
                        src={primaryLogo}
                        alt={item + " logo"}
                        referrerPolicy="strict-origin-when-cross-origin"
                        onError={(event) => {
                          if (fallbackLogo && event.currentTarget.src !== fallbackLogo) {
                            event.currentTarget.src = fallbackLogo;
                            return;
                          }
                          event.currentTarget.style.display = "none";
                        }}
                        className="absolute inset-0 h-full w-full bg-white object-contain p-1.5"
                      />
                    )}
                  </span>
                  <span className="text-xs font-semibold text-[hsl(var(--tekh-navy))] dark:text-zinc-100">{item}</span>
                </button>
              );
            })}
            {loadingBrands && <div className="col-span-full py-2 text-center text-xs font-medium text-muted-foreground">{t("simulator.identity.loadingBrands")}</div>}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[hsl(var(--tekh-navy))] dark:text-white">{t("simulator.identity.modelQuestion")}</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--tekh-green))]" />
              <input
                value={model}
                onChange={(event) => selectModel(event.target.value)}
                disabled={!brand || loadingModels}
                list="tekh-models"
                placeholder={!brand ? t("simulator.identity.chooseBrand") : loadingModels ? t("simulator.identity.loadingModels") : t("simulator.identity.modelPlaceholder")}
                className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm font-semibold text-[hsl(var(--tekh-navy))] outline-none transition-all placeholder:font-medium placeholder:text-zinc-400 focus:border-[hsl(var(--tekh-green))] focus:bg-white focus:ring-4 focus:ring-[hsl(var(--tekh-green))]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <datalist id="tekh-models">{models.map((item) => <option key={item} value={item} />)}</datalist>
            </div>
            {brand && models.length > 0 && <p className="text-xs font-medium text-muted-foreground">{t("simulator.identity.availableModels", { count: models.length })}</p>}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[hsl(var(--tekh-navy))] dark:text-white">{t("simulator.identity.storageQuestion")}</p>
            <div className="grid grid-cols-3 gap-2">
              {availableStorages.map((value) => (
                <button key={value} type="button" disabled={!model || loadingStorages} onClick={() => { setStorage(value); setRam(null); }} className={cn(
                  "flex h-14 items-center justify-center rounded-2xl border text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40",
                  storage === value ? "border-[hsl(var(--tekh-green))] bg-[hsl(var(--tekh-green))] text-white shadow-md shadow-emerald-950/20" : "border-zinc-200 bg-white text-[hsl(var(--tekh-navy))] hover:border-[hsl(var(--tekh-green))]/50 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                )}>{formatCapacity(value)}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-zinc-100 pt-6 dark:border-white/10">
          <div className="flex items-center gap-2"><MemoryStick className="h-4 w-4 text-[hsl(var(--tekh-green))]" /><p className="text-sm font-semibold text-[hsl(var(--tekh-navy))] dark:text-white">{t("simulator.identity.ramQuestion")}</p></div>
          <div className="grid grid-cols-4 gap-2 sm:max-w-md">
            {availableRams.map((value) => (
              <button key={value} type="button" disabled={!storage} onClick={() => setRam(value)} className={cn(
                "flex h-14 flex-col items-center justify-center rounded-2xl border transition-all disabled:cursor-not-allowed disabled:opacity-40",
                ram === value ? "border-[hsl(var(--tekh-green))] bg-[hsl(var(--tekh-green))]/10 text-[hsl(var(--tekh-green))] ring-1 ring-[hsl(var(--tekh-green))]" : "border-zinc-200 bg-white text-[hsl(var(--tekh-navy))] hover:border-[hsl(var(--tekh-green))]/50 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
              )}><span className="text-sm font-bold">{value} Go</span><span className="text-[9px] font-medium uppercase tracking-wide opacity-65">RAM</span></button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--tekh-green))]/15 bg-[hsl(var(--tekh-green))]/[0.06] p-4 text-sm text-[hsl(var(--tekh-navy))] dark:text-zinc-200">
          <Database className="h-5 w-5 shrink-0 text-[hsl(var(--tekh-green))]" />
          <span><strong>{t("simulator.identity.securedTitle")}</strong> {t("simulator.identity.securedText")}</span>
        </div>
      </div>
    </section>
  );
};
