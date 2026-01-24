import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { fetchBrands, fetchModels, fetchStorages, fetchAllStorages, fetchRams, fetchAllRams, getBasePriceCFA } from "@/lib/supabaseApi";
import { calculerEstimation } from "@/lib/pricing";

const ISSUE_LIST = [
  { key: "battery", label: "Batterie faible", deduction: 20000 },
  { key: "camera", label: "Caméra défectueuse", deduction: 15000 },
  { key: "audio", label: "Micro / Haut-parleurs défectueux", deduction: 15000 },
  { key: "biom", label: "FaceID / TouchID HS", deduction: 25000 },
  { key: "chassis", label: "Châssis abîmé", deduction: 10000 },
  { key: "back", label: "Dos fissuré", deduction: 10000 },
  { key: "water", label: "Oxydation / Contact avec l'eau", deduction: 30000 },
];

export default function EstimatorPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [storages, setStorages] = useState<number[]>([]);
  const [rams, setRams] = useState<number[]>([]);

  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [storage, setStorage] = useState<number | null>(null);
  const [ram, setRam] = useState<number | null>(null);

  const [screenState, setScreenState] = useState<"intact" | "cracked" | "burned" | "dead" | "">("");
  const [batteryState, setBatteryState] = useState<"good" | "low" | "replace" | "">("");
  const [biometricsState, setBiometricsState] = useState<"ok" | "nok" | "na" | "">("");
  const [cameraState, setCameraState] = useState<"ok" | "degraded" | "nok" | "">("");
  const [aestheticState, setAestheticState] = useState<"very_good" | "visible" | "damaged" | "">("");
  const [notes, setNotes] = useState("");

  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingStorages, setLoadingStorages] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const [basePrice, setBasePrice] = useState<number | null>(null);

  const [screenBroken, setScreenBroken] = useState(false);
  const [issueState, setIssueState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoadingBrands(true);
        const list = await fetchBrands();
        setBrands(list);
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les marques.", variant: "destructive" as any });
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!brand) {
      setModels([]);
      setModel("");
      setStorages([]);
      setStorage(null);
      setBasePrice(null);
      return;
    }
    (async () => {
      try {
        setLoadingModels(true);
        const list = await fetchModels(brand);
        setModels(list);
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les modèles.", variant: "destructive" as any });
      } finally {
        setLoadingModels(false);
      }
    })();
  }, [brand]);

  useEffect(() => {
    if (!brand || !model) {
      setStorages([]);
      setStorage(null);
      setBasePrice(null);
      return;
    }
    (async () => {
      try {
        setLoadingStorages(true);
        const [byModel, all] = await Promise.all([
          fetchStorages(brand, model),
          fetchAllStorages(),
        ]);
        const union = Array.from(new Set([...(byModel || []), ...(all || [])])).sort((a, b) => a - b);
        setStorages(union);
        // RAM options
        const [byModelRam, allRams] = await Promise.all([
          fetchRams(brand, model),
          fetchAllRams(),
        ]);
        const unionRams = Array.from(new Set([...(byModelRam || []), ...(allRams || [])])).sort((a, b) => a - b);
        setRams(unionRams);
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer les stockages.", variant: "destructive" as any });
      } finally {
        setLoadingStorages(false);
      }
    })();
  }, [brand, model]);

  useEffect(() => {
    if (!brand || !model || !storage) {
      setBasePrice(null);
      return;
    }
    (async () => {
      try {
        setLoadingPrice(true);
        const price = await getBasePriceCFA(brand, model, storage);
        setBasePrice(price);
      } catch (e: any) {
        toast({ title: "Erreur Supabase", description: e?.message || "Impossible de récupérer le prix.", variant: "destructive" as any });
      } finally {
        setLoadingPrice(false);
      }
    })();
  }, [brand, model, storage]);

  const finalPrice = useMemo(() => {
    if (!basePrice) return null;

    const diagnostics = {
      ecran_casse: !!screenState && screenState !== "intact",
      batterie_faible: batteryState === "low" || batteryState === "replace",
      face_id_hs: biometricsState === "nok",
      camera_hs: cameraState === "nok" || cameraState === "degraded",
      etat_moyen: aestheticState === "visible" || aestheticState === "damaged"
    };

    return calculerEstimation(basePrice, diagnostics);
  }, [basePrice, screenState, batteryState, biometricsState, cameraState, aestheticState]);

  const pivot = useMemo(() => basePrice ? Math.round(basePrice * 0.75) : null, [basePrice]);
  const otherDeductions = useMemo(() => {
    if (!pivot || !finalPrice) return 0;
    // Just for display: difference between pivot and final (if final is lower)
    // Note: if screen is broken, the "deduction" is huge (70% + implicitly), 
    // but the UI logic previously showed deductions only if screen was intact.
    if (screenState && screenState !== 'intact') return 0; // or hide decotes
    return Math.max(0, pivot - finalPrice);
  }, [pivot, finalPrice, screenState]);

  const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(n);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle>Estimer mon téléphone</CardTitle>
            <CardDescription>Choisissez votre appareil puis indiquez les pannes éventuelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Marque</Label>
                <Select value={brand || undefined as any} onValueChange={(v) => setBrand(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBrands ? "Chargement..." : "Sélectionner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modèle</Label>
                <Select value={model || undefined as any} onValueChange={(v) => setModel(v)} disabled={!brand || loadingModels}>
                  <SelectTrigger>
                    <SelectValue placeholder={!brand ? "Choisissez une marque" : loadingModels ? "Chargement..." : "Sélectionner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Stockage</Label>
                <Select value={(storage ? String(storage) : undefined) as any} onValueChange={(v) => setStorage(Number(v))} disabled={!model || loadingStorages}>
                  <SelectTrigger>
                    <SelectValue placeholder={!model ? "Choisissez un modèle" : loadingStorages ? "Chargement..." : "Sélectionner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {storages.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s} Go</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>État de l'écran</Label>
                  <Select value={screenState || undefined as any} onValueChange={(v) => setScreenState(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intact">Écran intact</SelectItem>
                      <SelectItem value="cracked">Écran fissuré / cassé</SelectItem>
                      <SelectItem value="burned">Écran brûlé / taches / lignes</SelectItem>
                      <SelectItem value="dead">Écran non fonctionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batterie</Label>
                    <Select value={batteryState || undefined as any} onValueChange={(v) => setBatteryState(v as any)} disabled={!!screenState && screenState !== 'intact'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Bonne</SelectItem>
                        <SelectItem value="low">Faible (&lt; 80%)</SelectItem>
                        <SelectItem value="replace">À remplacer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Biométrie</Label>
                    <Select value={biometricsState || undefined as any} onValueChange={(v) => setBiometricsState(v as any)} disabled={!!screenState && screenState !== 'intact'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">Fonctionnel</SelectItem>
                        <SelectItem value="nok">Non fonctionnel</SelectItem>
                        <SelectItem value="na">Non applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Appareil photo</Label>
                    <Select value={cameraState || undefined as any} onValueChange={(v) => setCameraState(v as any)} disabled={!!screenState && screenState !== 'intact'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">Fonctionnel</SelectItem>
                        <SelectItem value="degraded">Dégradé (flou/taches)</SelectItem>
                        <SelectItem value="nok">Non fonctionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>État esthétique</Label>
                    <Select value={aestheticState || undefined as any} onValueChange={(v) => setAestheticState(v as any)} disabled={!!screenState && screenState !== 'intact'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_good">Très bon état</SelectItem>
                        <SelectItem value="visible">Rayures visibles / chocs légers</SelectItem>
                        <SelectItem value="damaged">Châssis/dos fortement endommagé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>RAM (optionnel)</Label>
                  <Select value={(ram ? String(ram) : undefined) as any} onValueChange={(v) => setRam(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder={rams.length ? "Sélectionner" : "Aucune donnée"} />
                    </SelectTrigger>
                    <SelectContent>
                      {rams.map((x) => (
                        <SelectItem key={x} value={String(x)}>{x} Go</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">{pivot ? `Prix pivot: ${formatCFA(pivot)}` : loadingPrice ? "Calcul du prix pivot..." : "Sélectionnez marque, modèle et stockage"}</div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-card/80">
                  <div className="text-sm text-foreground">Montant de rachat estimé</div>
                  <div className="text-3xl font-bold mt-1 text-foreground">
                    {finalPrice !== null ? formatCFA(finalPrice) : "—"}
                  </div>
                  {pivot && screenState === 'intact' ? (
                    <div className="text-xs text-muted-foreground mt-2">Décotes: {formatCFA(otherDeductions)}</div>
                  ) : null}
                  <div className="text-xs text-muted-foreground mt-2">Cette estimation est basée sur les informations fournies. Offre valable 72 heures après validation en agence.</div>
                </div>
                <Button
                  disabled={finalPrice === null}
                  onClick={() => {
                    if (finalPrice !== null) {
                      localStorage.setItem("tekh_user_estimate", String(finalPrice));
                      toast({ title: "Estimation enregistrée", description: `${brand} ${model} • ${storage ?? "?"} Go • ${formatCFA(finalPrice)}` });
                    }
                  }}
                  className="w-full"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
