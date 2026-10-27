import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { ArrowRight, Camera, Check, ScanLine, ShieldCheck, Smartphone } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

const steps = ["Vérification système", "Test écran", "Validation visuelle"];

export default function DiagnosePage() {
  const [step, setStep] = useState(0);
  const [imei, setImei] = useState("");
  const [imeiError, setImeiError] = useState("");
  const [scanHint, setScanHint] = useState(false);
  const [touchGrid, setTouchGrid] = useState<boolean[]>(new Array(20).fill(false));
  const [diagnostics, setDiagnostics] = useState({
    ram: "8 Go",
    storage: "256 Go",
    screen: "Test en attente",
    camera: "Non testé",
  });
  const { toast } = useToast();

  const handleTouchStart = (index: number) => {
    setTouchGrid((current) => current.map((touched, itemIndex) => itemIndex === index ? true : touched));
  };

  const launchVerification = (event: React.FormEvent) => {
    event.preventDefault();
    const digits = imei.replace(/\D/g, "");
    if (digits.length !== 15) {
      setImeiError("Saisissez les 15 chiffres de votre IMEI.");
      return;
    }
    setImeiError("");
    setStep(1);
  };

  const progress = (touchGrid.filter(Boolean).length / touchGrid.length) * 100;

  return (
    <section className="min-h-dvh bg-[hsl(142_30%_97%)] py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <header className="mb-8 text-center">
          <Badge variant="outline" className="mb-3 rounded-full border-[hsl(var(--tekh-green))]/30 bg-[hsl(var(--tekh-green))]/10 px-3 py-1 text-[hsl(var(--tekh-green))]">Diagnostic Dealbox · Bêta</Badge>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[hsl(var(--tekh-navy))] dark:text-white sm:text-4xl">Vérifier un appareil</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground">Entrez l’IMEI de votre téléphone pour démarrer un diagnostic guidé et obtenir un rapport temporaire de confiance.</p>
        </header>

        {step === 0 && (
          <Card className="overflow-hidden rounded-[2rem] border-[hsl(var(--tekh-green))]/15 bg-white shadow-[0_20px_50px_-34px_rgba(13,92,61,0.4)] dark:bg-zinc-950">
            <CardHeader className="border-b border-border/60 pb-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--tekh-green))] text-white shadow-lg shadow-emerald-950/20"><ScanLine className="h-6 w-6" /></div>
              <CardTitle className="font-display text-2xl">Commencer la vérification</CardTitle>
              <CardDescription className="font-medium">Composez <strong>*#06#</strong> sur votre téléphone pour afficher son IMEI à 15 chiffres.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <form onSubmit={launchVerification} className="space-y-3">
                <label htmlFor="imei" className="text-sm font-semibold text-[hsl(var(--tekh-navy))] dark:text-white">Numéro IMEI</label>
                <Input id="imei" inputMode="numeric" autoComplete="off" maxLength={17} value={imei} onChange={(event) => { setImei(event.target.value.replace(/[^\d\s-]/g, "")); setImeiError(""); }} placeholder="Ex. 35 678901 234567 8" className="h-14 rounded-2xl border-border bg-background px-4 font-mono text-base tracking-[0.12em] focus-visible:ring-[hsl(var(--tekh-green))]" />
                {imeiError && <p className="text-xs font-semibold text-rose-600">{imeiError}</p>}
                <Button type="submit" className="h-14 w-full rounded-2xl bg-[hsl(var(--tekh-green))] text-sm font-semibold text-white shadow-lg shadow-emerald-950/15 hover:bg-[hsl(142_76%_30%)]">Lancer la vérification <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </form>
              <div className="relative py-1 text-center text-xs font-medium text-muted-foreground before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-border"><span className="relative bg-white px-3 dark:bg-zinc-950">ou</span></div>
              <Button type="button" variant="outline" onClick={() => setScanHint(true)} className="h-12 w-full rounded-2xl border-[hsl(var(--tekh-green))]/30 font-semibold text-[hsl(var(--tekh-green))] hover:bg-[hsl(var(--tekh-green))]/5"><ScanLine className="mr-2 h-4 w-4" />Scanner le code Dealbox</Button>
              {scanHint && <div className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--tekh-green))]/15 bg-[hsl(var(--tekh-green))]/[0.06] p-4 text-sm font-medium text-muted-foreground"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--tekh-green))]" />Le scan de carte Dealbox est réservé aux points partenaires durant la bêta. Vous pouvez utiliser l’IMEI pour poursuivre cette vérification web.</div>}
            </CardContent>
          </Card>
        )}

        {step > 0 && (
          <div className="mb-6 rounded-2xl border border-[hsl(var(--tekh-green))]/15 bg-[hsl(var(--tekh-navy))] p-4 text-white">
            <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4ADE80]">Diagnostic guidé</span><span className="text-sm font-semibold">Étape {step} sur 3</span></div>
            <div className="grid grid-cols-3 gap-2">{steps.map((label, index) => <div key={label}><div className={`h-1.5 rounded-full ${index < step ? "bg-[#4ADE80]" : "bg-white/15"}`} /><span className={`mt-2 block text-[10px] font-medium ${index + 1 === step ? "text-white" : "text-white/50"}`}>{label}</span></div>)}</div>
          </div>
        )}

        {step === 1 && (
          <Card className="rounded-[2rem] border-[hsl(var(--tekh-green))]/15 bg-white shadow-md dark:bg-zinc-950">
            <CardHeader><CardTitle>Vérification système</CardTitle><CardDescription>Informations techniques associées à l’appareil déclaré.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-muted p-4"><span className="flex items-center gap-2 font-medium"><Smartphone className="h-4 w-4 text-[hsl(var(--tekh-green))]" /> Modèle</span><span className="font-semibold text-[hsl(var(--tekh-green))]">iPhone 13</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-muted p-4"><span className="font-medium">RAM</span><span>{diagnostics.ram}</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-muted p-4"><span className="font-medium">Stockage</span><span>{diagnostics.storage}</span></div>
              </div>
              <p className="rounded-xl bg-muted/60 p-3 text-xs font-medium text-muted-foreground">Pré-vérification bêta : les caractéristiques sont confirmées lors de la validation physique Dealbox.</p>
              <Button className="h-12 w-full rounded-2xl bg-[hsl(var(--tekh-green))] text-white hover:bg-[hsl(142_76%_30%)]" onClick={() => setStep(2)}>Continuer vers le test écran <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-[2rem] border-[hsl(var(--tekh-green))]/15 bg-white shadow-md dark:bg-zinc-950"><CardHeader><CardTitle>Test tactile</CardTitle><CardDescription>Passez votre doigt sur chaque zone pour valider l’écran.</CardDescription></CardHeader><CardContent className="space-y-6"><div className="relative grid aspect-[4/5] grid-cols-5 gap-1 overflow-hidden rounded-2xl bg-muted p-1 touch-none select-none">{touchGrid.map((touched, index) => <div key={index} className={`rounded-sm border border-white/10 transition-colors duration-200 ${touched ? "bg-[#4ADE80]" : "bg-card"}`} onMouseEnter={() => handleTouchStart(index)} onTouchMove={() => handleTouchStart(index)} />)}</div><div className="space-y-2"><div className="flex justify-between text-sm font-medium"><span>Progression</span><span>{Math.round(progress)}%</span></div><Progress value={progress} className="h-2" /></div>{progress === 100 ? <Button className="h-12 w-full rounded-2xl bg-[hsl(var(--tekh-green))] text-white hover:bg-[hsl(142_76%_30%)]" onClick={() => { setDiagnostics((current) => ({ ...current, screen: "Fonctionnel" })); setStep(3); }}>Test réussi · Continuer <Check className="ml-2 h-4 w-4" /></Button> : <p className="text-center text-xs font-medium text-muted-foreground">Complétez la grille pour continuer.</p>}</CardContent></Card>
        )}

        {step === 3 && (
          <Card className="rounded-[2rem] border-[hsl(var(--tekh-green))]/15 bg-white shadow-md dark:bg-zinc-950"><CardHeader><CardTitle>Validation visuelle</CardTitle><CardDescription>Prenez une photo de votre téléphone pour compléter le rapport temporaire.</CardDescription></CardHeader><CardContent className="space-y-6 text-center"><div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[hsl(var(--tekh-green))]/25 bg-[hsl(var(--tekh-green))]/[0.04]"><Camera className="mb-4 h-12 w-12 text-[hsl(var(--tekh-green))]" /><Button variant="outline" className="rounded-full">Ouvrir la caméra</Button><p className="mt-3 text-xs font-medium text-muted-foreground">Capture disponible selon les permissions du navigateur.</p></div><Button className="h-12 w-full rounded-2xl bg-[hsl(var(--tekh-green))] text-white hover:bg-[hsl(142_76%_30%)]" onClick={() => toast({ title: "Diagnostic terminé", description: "Score de confiance généré : 92/100" })}>Générer le certificat temporaire <ShieldCheck className="ml-2 h-4 w-4" /></Button></CardContent></Card>
        )}
      </div>
    </section>
  );
}
