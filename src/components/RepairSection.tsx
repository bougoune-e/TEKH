import repairImg from "../../assets/illustrations/homepage/repair_image_phone.jpeg";
import { Wrench, Battery, Cpu, ShieldCheck, ScanLine, Sparkles } from "lucide-react";

const features = [
  { icon: ScanLine, title: "Diagnostic rapide", desc: "Analyse complète de l'appareil en 24h: écran, batterie, capteurs, stockage." },
  { icon: Wrench, title: "Changement d’écran", desc: "Remplacement avec pièces premium, alignement et calibration d'usine." },
  { icon: Battery, title: "Réparation batterie", desc: "Batteries testées et certifiées, performance et autonomie garanties." },
  { icon: Cpu, title: "Réparation carte mère", desc: "Interventions micro‑soudure: connecteurs, circuits d’alimentation, audio, etc." },
  { icon: Sparkles, title: "Reconditionnement premium", desc: "Nettoyage, polissage, tests multi‑points, remise à neuf esthétique." },
  { icon: ShieldCheck, title: "Pièces garanties 6 mois", desc: "Toutes les réparations sont couvertes par une garantie pièces et main‑d’œuvre." },
];

const RepairSection = () => {
  return (
    <section className="py-16 md:py-24 section-invert border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Illustration */}
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-card">
            <img src={repairImg} alt="Réparation et reconditionnement" className="w-full h-full object-cover" />
          </div>

          {/* Texte + features */}
          <div>
            <h2 className="text-3xl font-bold mb-3">Réparations & reconditionnement</h2>
            <p className="text-muted-foreground mb-6">
              Nos techniciens certifiés effectuent un diagnostic précis, réparent avec des pièces premium et valident chaque étape par des tests qualité.
              Chaque appareil reconditionné subit une série de contrôles pour garantir performance, autonomie et esthétique.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-smooth">
                  <div className="flex items-start gap-3">
                    <f.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      <div className="text-sm text-muted-foreground">{f.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RepairSection;
