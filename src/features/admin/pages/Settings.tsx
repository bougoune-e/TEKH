import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

const STORAGE_KEY = "tekh:admin-settings";

type AdminSettings = {
  commissionPct: number;
  dealExpiryHours: number;
  maxImagesPerDeal: number;
  whatsappSupport: string;
  maintenanceMode: boolean;
  allowNewAnnonces: boolean;
};

const DEFAULTS: AdminSettings = {
  commissionPct: 5,
  dealExpiryHours: 72,
  maxImagesPerDeal: 5,
  whatsappSupport: "",
  maintenanceMode: false,
  allowNewAnnonces: true,
};

function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch { return DEFAULTS; }
}

function saveSettings(s: AdminSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-6 py-4 border-b last:border-0">
    <div className="flex-1">
      <div className="text-sm font-medium">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? "bg-primary" : "bg-muted"}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
  </button>
);

const Settings = () => {
  const [settings, setSettings] = useState<AdminSettings>(loadSettings);
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = () => {
    saveSettings(settings);
    setDirty(false);
    toast.success("Paramètres sauvegardés");
  };

  const reset = () => {
    setSettings(DEFAULTS);
    saveSettings(DEFAULTS);
    setDirty(false);
    toast.success("Paramètres réinitialisés");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configuration de l'application TEKH+</p>
        </div>
        <Button onClick={save} disabled={!dirty} className="bg-[#064e3b] hover:bg-[#065f46]">
          <Save className="h-4 w-4 mr-2" /> Sauvegarder
        </Button>
      </div>

      {/* Marketplace */}
      <div className="rounded-xl border bg-card shadow-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Marketplace</div>

        <Field label="Commission (%)" hint="Pourcentage prélevé sur chaque transaction TEKH+">
          <input
            type="number"
            min={0}
            max={100}
            value={settings.commissionPct}
            onChange={(e) => update("commissionPct", Number(e.target.value))}
            className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <Field label="Expiration des annonces (heures)" hint="Durée de visibilité d'une annonce publiée">
          <input
            type="number"
            min={1}
            max={720}
            value={settings.dealExpiryHours}
            onChange={(e) => update("dealExpiryHours", Number(e.target.value))}
            className="w-24 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <Field label="Images max par annonce" hint="Nombre maximum de photos uploadables par annonce">
          <input
            type="number"
            min={1}
            max={10}
            value={settings.maxImagesPerDeal}
            onChange={(e) => update("maxImagesPerDeal", Number(e.target.value))}
            className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </Field>

        <Field label="Autoriser les nouvelles annonces" hint="Désactiver temporairement les dépôts d'annonces">
          <Toggle value={settings.allowNewAnnonces} onChange={(v) => update("allowNewAnnonces", v)} />
        </Field>
      </div>

      {/* Support */}
      <div className="rounded-xl border bg-card shadow-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Support</div>

        <Field label="WhatsApp support" hint="Numéro affiché dans l'app pour contacter le support (format international)">
          <input
            type="tel"
            placeholder="+228 90000000"
            value={settings.whatsappSupport}
            onChange={(e) => update("whatsappSupport", e.target.value)}
            className="w-48 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </Field>
      </div>

      {/* Système */}
      <div className="rounded-xl border bg-card shadow-card p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Système</div>

        <Field
          label="Mode maintenance"
          hint="Affiche un message d'indisponibilité aux utilisateurs (non implémenté en runtime sans Edge Function)"
        >
          <Toggle value={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
        </Field>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Réinitialiser les paramètres par défaut
        </button>
        <p className="text-xs text-muted-foreground">
          Les paramètres sont stockés localement (localStorage). Une intégration Supabase est nécessaire pour les partager entre admins.
        </p>
      </div>
    </div>
  );
};

export default Settings;
