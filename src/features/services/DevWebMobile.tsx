import { useState } from "react";
import { Code, Globe, ShoppingCart, Smartphone, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";

const OFFERS = [
  { icon: Globe, label: "Sites vitrines" },
  { icon: ShoppingCart, label: "E-commerce" },
  { icon: Smartphone, label: "PWA & Applications mobiles" },
  { icon: Bot, label: "Intégration IA" },
];

const PROCESS = ["Analyse", "Prototype", "Développement", "Déploiement", "Maintenance"];

export default function DevWebMobile() {
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demande envoyée", {
      description: "Nous vous recontacterons pour discuter de votre projet.",
    });
    setProjectType("");
    setBudget("");
    setDeadline("");
    setDescription("");
  };

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#064e3b] flex items-center justify-center">
            <Code className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Développement Web & Mobile</h1>
            <p className="text-sm text-muted-foreground font-medium">Applications et plateformes sur mesure</p>
          </div>
        </div>

        <section className="mb-10">
          <p className="text-lg font-bold text-foreground mb-6">
            Nous développons des applications et plateformes sur mesure pour entreprises et entrepreneurs.
          </p>
          <h2 className="text-base font-black text-foreground mb-3">Ce que nous faisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OFFERS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <Icon className="h-5 w-5 text-[#064e3b] shrink-0" />
                <span className="font-bold text-sm">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-black text-foreground mb-3">Notre process</h2>
          <div className="flex flex-wrap gap-2">
            {PROCESS.map((step, i) => (
              <span
                key={step}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#064e3b]/10 text-[#064e3b] font-bold text-sm"
              >
                <span className="w-5 h-5 rounded-full bg-[#064e3b] text-white text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-border bg-card p-6">
          <h2 className="text-lg font-black text-foreground mb-4">Demander un devis</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Type de projet</Label>
              <Input
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="Site web, app mobile, e-commerce..."
                className="h-12 rounded-xl border-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Budget estimatif (FCFA)</Label>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: 500 000 - 1 000 000"
                className="h-12 rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Délai souhaité</Label>
              <Input
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Ex: 3 mois, ASAP..."
                className="h-12 rounded-xl border-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Description du projet</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre projet, vos objectifs..."
                className="w-full min-h-[120px] rounded-xl border-2 border-input bg-background px-4 py-3 font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#064e3b] resize-none"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-black bg-[#064e3b] hover:bg-[#065f46] text-white flex items-center justify-center gap-2"
            >
              Demander un devis <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
