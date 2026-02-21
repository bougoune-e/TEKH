import logo from "@/assets/logos/robott.jpeg";

const AboutSection = () => {
  return (
    <section id="a-propos" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-5xl mx-auto space-y-20">

          {/* Header — L'échange comme identité */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src={logo} alt="TΞKΗ+" className="h-16 w-16 rounded-2xl ring-2 ring-primary/20 shadow-2xl" />
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-black dark:text-white">
                  L'Échange,<br /><span style={{ color: '#00FF41' }}>pas la vente.</span>
                </h2>
              </div>
              <p className="text-xl text-slate-500 font-bold leading-relaxed">
                Sur TΞKΗ+, vous n'achetez pas. Vous n'vendez pas. Vous <strong className="text-black dark:text-white">échangez</strong>. C'est la finalité absolue, le cœur battant de la plateforme — un troc intelligent, certifié et équitable pour l'Afrique.
              </p>
            </div>
            <div className="relative group p-8 rounded-[40px] border-2 border-black dark:border-white shadow-2xl overflow-hidden" style={{ backgroundColor: '#00FF41' }}>
              <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-8xl uppercase tracking-tighter select-none text-black">SWAP</div>
              <p className="relative z-10 text-2xl font-black italic text-black">
                "Ici, votre téléphone ne se vend pas. Il se transforme en un autre téléphone."
              </p>
            </div>
          </div>

          {/* Ce qui définit TEKH+ */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#00FF41' }}>Notre Mission</h3>
              <p className="text-slate-500 font-bold leading-relaxed">
                Permettre à chaque citoyen d'<strong className="text-black dark:text-white">échanger</strong> son appareil contre un modèle supérieur, sans débourser le prix du neuf. L'échange est notre moteur — pas la transaction commerciale classique.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#00FF41' }}>Notre Vision</h3>
              <p className="text-slate-500 font-bold leading-relaxed">
                Faire du <strong className="text-black dark:text-white">SWAP</strong> le réflexe numéro un en Afrique. Quand votre téléphone vieillit, vous ne le jetez pas, vous ne le vendez pas — vous l'échangez via TΞKΗ+, certifié DEALBOX, en toute sécurité.
              </p>
            </div>

            <div className="p-8 rounded-[32px] bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:-translate-y-2 transition-all duration-500 shadow-xl">
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight" style={{ color: '#00FF41' }}>Nos Valeurs</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#00FF41' }} />
                  <span className="text-slate-500 font-bold"><strong className="text-black dark:text-white">L'Échange d'abord</strong> — jamais la vente sèche</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#00FF41' }} />
                  <span className="text-slate-500 font-bold">Équité & Transparence du SWAP</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-2 w-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: '#00FF41' }} />
                  <span className="text-slate-500 font-bold">Responsabilité Écologique</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bloc manifeste — L'échange comme philosophie */}
          <div className="space-y-12 font-bold leading-relaxed text-lg">
            <section className="space-y-4">
              <h3 className="text-3xl font-black text-black dark:text-white">Pourquoi l'échange et non la vente ?</h3>
              <p className="text-slate-500">
                La vente crée une transaction à sens unique. L'<strong className="text-black dark:text-white">échange</strong> crée une relation d'équité. Sur TΞKΗ+, vous apportez votre appareil, notre algorithme calcule sa valeur réelle, et vous repartez avec un appareil supérieur — la différence de valeur est compensée de façon transparente et certifiée.
              </p>
              <p className="text-slate-500">
                Ce modèle est fondamentalement différent d'une marketplace classique. Nous ne sommes pas un site de petites annonces. Nous sommes une <strong className="text-black dark:text-white">plateforme de SWAP certifié</strong> — chaque appareil passe par 50 points de contrôle avant d'entrer dans le circuit d'échange.
              </p>
            </section>

            <section className="space-y-4 p-10 bg-black dark:bg-white text-white dark:text-black rounded-[40px] shadow-2xl">
              <h3 className="text-3xl font-black">L'Impact de l'Échange</h3>
              <p className="opacity-80">
                Chaque SWAP réalisé via TΞKΗ+ évite la production d'un nouvel appareil, économise des ressources naturelles critiques (Lithium, Cobalt, Terres rares) et réduit massivement l'empreinte carbone. L'échange n'est pas seulement intelligent — il est <strong>responsable</strong>.
              </p>
              <div className="flex gap-8 mt-6">
                <div>
                  <span className="block text-4xl font-black">80kg</span>
                  <span className="text-xs uppercase font-black opacity-60">CO2 Économisés / échange</span>
                </div>
                <div>
                  <span className="block text-4xl font-black">200g</span>
                  <span className="text-xs uppercase font-black opacity-60">Déchets Minerais en moins</span>
                </div>
                <div>
                  <span className="block text-4xl font-black">0</span>
                  <span className="text-xs uppercase font-black opacity-60">Ventes sans échange</span>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
