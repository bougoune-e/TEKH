import { CheckCircle2, Ban, Scale } from "lucide-react";

const points = [
  { t: "Marque & modèle", d: "On privilégie des échanges dans une même gamme pour une valeur équitable." },
  { t: "État général", d: "L’appareil doit s’allumer, sans casse majeure ni défaut critique (écran/boutons/humidité)." },
  { t: "Fonctionnalités", d: "Appels, écran tactile, caméras, boutons: tout doit fonctionner correctement." },
  { t: "Âge & demande", d: "L’ancienneté et la popularité du modèle influencent la valeur d’échange." },
  { t: "Accessoires", d: "Boîte, chargeur, facture: leur présence peut valoriser l’échange." },
  { t: "Esthétique", d: "Plusieurs grades: correct, bon, très bon, comme neuf." },
];

export default function ExchangeCriteria() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Scale className="h-6 w-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold">Critères d’équivalence pour l’échange</h2>
        </div>

        <p className="text-muted-foreground mb-8 max-w-3xl">
          Nous évaluons la valeur réelle des appareils pour proposer un échange transparent. Si les modèles diffèrent, une
          compensation peut s’appliquer selon le stockage, le processeur, l’état batterie, etc.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {points.map((p) => (
            <div key={p.t} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold">{p.t}</div>
                  <div className="text-sm text-muted-foreground">{p.d}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
          <Ban className="h-4 w-4 mt-0.5 text-destructive" />
          <p>
            Exclusions: téléphones volés, contrefaits, hors d’usage, ou avec pièces non originales non déclarées ne sont pas admis.
          </p>
        </div>
      </div>
    </section>
  );
}
