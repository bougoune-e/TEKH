import { ShieldCheck, Scale, BadgeCheck, Wallet, AlertTriangle, Users, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Charte = () => {
  const items = [
    {
      icon: Users,
      title: "L'Esprit du SWAP",
      points: [
        "Mise en relation pour échanger des téléphones entre particuliers de manière équitable.",
        "Favoriser le troc direct pour éviter l'inflation des prix du neuf.",
        "Possibilité de rajout (Soulte) si les deux appareils n'ont pas la même valeur.",
      ],
    },
    {
      icon: BadgeCheck,
      title: "Transparence Radicale",
      points: [
        "Obligation de fournir des photos réelles montrant tous les angles de l'appareil.",
        "Description honnête : chaque micro-rayure ou usure batterie doit être mentionnée.",
        "Indiquer clairement si l'appareil a déjà subi des réparations tierces.",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Sécurité & Vérification",
      points: [
        "Utilisation recommandée de nos points de swap certifiés pour l'échange physique.",
        "Blocage des fonds via SWAP Wallet jusqu'à confirmation de réception par les deux parties.",
        "Signalement immédiat de tout comportement suspect ou tentative de 'off-platform'.",
      ],
    },
    {
      icon: Scale,
      title: "Évaluation Équitable",
      points: [
        "L'algorithme TEKH+ sert de base neutre pour fixer la compensation.",
        "Liberté de négociation dans la limite des standards du marché local.",
        "Protection contre les propositions abusives ou dévalorisantes.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Intégrité du Réseau",
      points: [
        "Interdiction formelle des téléphones volés (vérification IMEI obligatoire).",
        "Bannissement définitif pour toute tentative de vente de contrefaçon.",
        "Respect mutuel et courtoisie lors de la messagerie WhatsApp ou interne.",
      ],
    },
    {
      icon: Wallet,
      title: "Garantie du Deal",
      points: [
        "Assurance optionnelle couvrant le transport vers le point de swap.",
        "Médiation TEKH+ gratuite en cas de désaccord sur l'état lors du face-à-face.",
        "Finalisation du deal uniquement après validation technique mutuelle.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
          <ChevronLeft className="h-5 w-5" />
          Retour à l'accueil
        </Link>

        <header className="text-center space-y-6 mb-20">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            Charte du <span className="text-primary tracking-normal">SWAP</span>
          </h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            Les 6 Commandements pour un échange sécurisé, équitable et respectueux.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="group">
                <div className="h-full bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-[32px] p-8 shadow-xl hover:border-primary transition-all duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Icon className="h-6 w-6 text-black" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{item.title}</h3>
                  </div>
                  <ul className="space-y-4">
                    {item.points.map((p, i) => (
                      <li key={i} className="flex gap-3 text-slate-500 font-bold leading-relaxed">
                        <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[32px] border-2 border-black dark:border-white text-center">
          <p className="text-lg font-black italic opacity-70 italic">"En swappant, vous n'échangez pas seulement un outil, vous partagez une vision du futur."</p>
        </div>
      </div>
    </div>
  );
};

export default Charte;
