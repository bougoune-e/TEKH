import { useState } from "react";
import { Wrench, ChevronRight, Smartphone, Laptop, Monitor, Tablet } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

const DEVICE_TYPES = [
  { id: "smartphone", label: "Smartphone", icon: Smartphone },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablette", icon: Tablet },
  { id: "other", label: "Autre", icon: Wrench },
];

const PROBLEM_TYPES = [
  "Écran cassé",
  "Batterie",
  "Ne s'allume plus",
  "Lent",
  "Virus",
  "Problème logiciel",
  "Autre",
];

const URGENCY_LEVELS = [
  { id: "normal", label: "Normal" },
  { id: "urgent", label: "Urgent (24h)" },
  { id: "diagnostic", label: "Diagnostic seulement" },
];

export default function MaintenanceIT() {
  const [step, setStep] = useState(1);
  const [device, setDevice] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("");
  const [otherProblem, setOtherProblem] = useState("");

  const handleSubmit = () => {
    toast.success("Demande envoyée", {
      description: "Nous vous recontacterons sous 24h pour votre devis.",
    });
    setStep(1);
    setDevice("");
    setBrandModel("");
    setProblem("");
    setUrgency("");
    setOtherProblem("");
  };

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#064e3b] flex items-center justify-center">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Maintenance IT</h1>
            <p className="text-sm text-muted-foreground font-medium">Réparations et support technique certifié</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-[#064e3b]" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-foreground">Type d'appareil</h2>
            <div className="grid grid-cols-2 gap-3">
              {DEVICE_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDevice(id)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    device === id ? "border-[#064e3b] bg-[#064e3b]/10" : "border-border bg-card"
                  }`}
                >
                  <Icon className="h-6 w-6 text-[#064e3b]" />
                  <span className="font-bold text-sm">{label}</span>
                </button>
              ))}
            </div>
            <Button
              onClick={() => device && setStep(2)}
              disabled={!device}
              className="w-full h-12 rounded-xl font-black bg-[#064e3b] hover:bg-[#065f46] text-white"
            >
              Suivant <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-foreground">Marque / Modèle</h2>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Appareil concerné</Label>
              <Input
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Ex: iPhone 14, Dell XPS 15..."
                className="h-12 rounded-xl border-2"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl font-bold">
                Retour
              </Button>
              <Button
                onClick={() => brandModel.trim() && setStep(3)}
                disabled={!brandModel.trim()}
                className="flex-1 h-12 rounded-xl font-black bg-[#064e3b] hover:bg-[#065f46] text-white"
              >
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-foreground">Nature du problème</h2>
            <div className="grid grid-cols-1 gap-2">
              {PROBLEM_TYPES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProblem(p)}
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${
                    problem === p ? "border-[#064e3b] bg-[#064e3b]/10" : "border-border bg-card"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {problem === "Autre" && (
              <Input
                value={otherProblem}
                onChange={(e) => setOtherProblem(e.target.value)}
                placeholder="Décrivez le problème..."
                className="h-12 rounded-xl border-2"
              />
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl font-bold">
                Retour
              </Button>
              <Button
                onClick={() => (problem !== "Autre" || otherProblem.trim()) && setStep(4)}
                disabled={!problem || (problem === "Autre" && !otherProblem.trim())}
                className="flex-1 h-12 rounded-xl font-black bg-[#064e3b] hover:bg-[#065f46] text-white"
              >
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-foreground">Niveau d'urgence</h2>
            <div className="space-y-2">
              {URGENCY_LEVELS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setUrgency(id)}
                  className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${
                    urgency === id ? "border-[#064e3b] bg-[#064e3b]/10" : "border-border bg-card"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-xl font-bold">
                Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!urgency}
                className="flex-1 h-12 rounded-xl font-black bg-[#064e3b] hover:bg-[#065f46] text-white"
              >
                Obtenir un devis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
