import { ShieldCheck, Scale, BadgeCheck, Wallet, AlertTriangle, Users } from "lucide-react";

const Charte = () => {
  const items = [
    {
      icon: Users,
      title: "Principe du SWAP",
      points: [
        "Mise en relation pour échanger des téléphones entre particuliers ou avec des revendeurs",
        "Échanges équitables (téléphone contre téléphone) ou compensés (différence de valeur)",
      ],
    },
    {
      icon: BadgeCheck,
      title: "État des téléphones",
      points: [
        "Photos réelles et récentes (avant/arrière, écran allumé)",
        "État: neuf, très bon, bon, endommagé",
        "Fonctionnalités testées: écran, réseau, caméra, batterie, etc.",
        "Mention: débloqué/tout opérateur, accessoires (chargeur/boîte/facture)",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Vérification & Sécurité",
      points: [
        "Les utilisateurs sont responsables des informations publiées",
        "Certaines annonces peuvent être vérifiées avant publication (option)",
        "Échanges via un système sécurisé (SWAP Wallet). Aucun échange hors plateforme n’est couvert",
      ],
    },
    {
      icon: Scale,
      title: "Valeur et compensation",
      points: [
        "Valorisation basée sur modèle exact, état et tendances du marché",
        "Calcul automatique d’une différence estimée et proposition d’un montant de compensation",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Éthique et transparence",
      points: [
        "Interdiction des téléphones volés, contrefaits ou bloqués",
        "Aucune annonce d’origine douteuse",
        "Respect des conditions d’utilisation sous peine de suspension",
      ],
    },
    {
      icon: Wallet,
      title: "Litiges & Protection",
      points: [
        "Médiation possible en cas de litige",
        "Fonds/objets peuvent être retenus le temps de la résolution",
        "Assurance optionnelle disponible",
      ],
    },
  ];

  return (
    <section id="charte" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Charte <span className="text-primary">SWAP</span>
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Règles et engagements pour des échanges responsables et sécurisés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative">
                <div className="relative bg-card border border-border rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="relative bg-primary p-2.5 rounded-xl">
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                    {item.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-sm text-foreground/70 text-center">
          SWAP encourage des échanges équitables, responsables et durables.
        </div>
      </div>
    </section>
  );
};

export default Charte;
