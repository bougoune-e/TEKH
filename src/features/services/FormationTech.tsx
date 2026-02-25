import { useState } from "react";
import { GraduationCap, Briefcase, TrendingUp, Rocket, Code, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

const OBJECTIVES = [
  { id: "emploi", label: "Trouver un emploi", icon: Briefcase },
  { id: "competence", label: "Monter en compétence", icon: TrendingUp },
  { id: "business", label: "Lancer un business", icon: Rocket },
  { id: "dev", label: "Devenir développeur", icon: Code },
  { id: "ia", label: "Automatiser mon travail avec l'IA", icon: Sparkles },
];

const PARCOURS: Record<string, { title: string; items: string[] }> = {
  emploi: {
    title: "Parcours Emploi",
    items: ["CV & LinkedIn optimisés", "Outils bureautique (Excel, Word)", "Entretien & soft skills", "Certifications reconnues"],
  },
  competence: {
    title: "Montée en compétence",
    items: ["Excel avancé & tableaux de bord", "Outils collaboratifs", "Gestion de projet", "Formation sur mesure"],
  },
  business: {
    title: "Lancer mon business",
    items: ["Création d'entreprise digitale", "Marketing & visibilité", "E-commerce & paiement", "Automatisation"],
  },
  dev: {
    title: "Devenir développeur",
    items: ["Bases de la programmation", "Web (HTML, CSS, JS)", "Frameworks & bases de données", "Projets pratiques"],
  },
  ia: {
    title: "Automatiser avec l'IA",
    items: ["Excel avancé & formules", "Automatisation IA", "Prompt engineering", "Outils no-code"],
  },
};

export default function FormationTech() {
  const [selected, setSelected] = useState<string | null>(null);
  const parcours = selected ? PARCOURS[selected] : null;

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#064e3b] flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Formation Tech</h1>
            <p className="text-sm text-muted-foreground font-medium">Coding, Excel, IA et compétences numériques</p>
          </div>
        </div>

        <h2 className="text-lg font-black text-foreground mb-4">Pourquoi voulez-vous vous former ?</h2>
        <div className="space-y-3 mb-8">
          {OBJECTIVES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                selected === id ? "border-[#064e3b] bg-[#064e3b]/10" : "border-border bg-card"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#064e3b]/20 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#064e3b]" />
              </div>
              <span className="font-bold text-foreground text-left flex-1">{label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {parcours && (
          <div className="rounded-2xl border-2 border-[#064e3b]/30 bg-[#064e3b]/5 p-6 space-y-4">
            <h3 className="text-xl font-black text-foreground">{parcours.title}</h3>
            <ul className="space-y-2">
              {parcours.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-foreground">
                  <span className="w-6 h-6 rounded-full bg-[#064e3b] text-white text-xs font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button className="w-full h-12 rounded-xl font-black bg-[#064e3b] hover:bg-[#065f46] text-white mt-4">
              Demander un parcours personnalisé
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
