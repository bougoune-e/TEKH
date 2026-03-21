import { Link } from "react-router-dom";
import { ChevronLeft, Coins, ArrowUpDown } from "lucide-react";

/**
 * Contenu aligné sur la charte métier TEKH+ (Section 9).
 */
const PolitiqueEchangeTekhPoints = () => {
  return (
    <main className="pt-24 pb-12 bg-white dark:bg-black text-black dark:text-white min-h-dvh">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour
        </Link>

        <header className="mb-10">
          <div className="h-14 w-14 bg-[#064e3b] dark:bg-[#059669] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
            <ArrowUpDown className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Politique d&apos;échange &amp; TekhPoints
          </h1>
          <p className="text-muted-foreground font-semibold text-sm md:text-base">
            TEKH+ — transparence sur les upgrades, downgrades et crédits TekhPoints.
          </p>
        </header>

        <div className="space-y-8 text-[15px] md:text-base leading-relaxed font-medium text-slate-800 dark:text-zinc-200">
          <p>
            Chez TEKH+, tous les échanges sont calculés de manière transparente via notre algorithme de
            valorisation.
          </p>

          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-6 space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-[#064e3b] dark:text-[#34d399] flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Upgrade
            </h2>
            <p className="text-sm md:text-[15px]">
              Vous échangez vers un appareil plus récent : vous payez la différence entre la valeur de votre
              appareil et l&apos;appareil que vous souhaitez obtenir.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03] p-6 space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide text-[#064e3b] dark:text-[#34d399]">
              Downgrade
            </h2>
            <p className="text-sm md:text-[15px]">
              Vous échangez vers un appareil moins cher : si la valeur de votre appareil dépasse celle de
              l&apos;appareil cible d&apos;un montant inférieur à 15 000 FCFA, TEKH+ absorbe la différence.
              Au-delà, le reliquat vous est crédité automatiquement en TekhPoints.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-3">
            <h2 className="text-lg font-black uppercase tracking-wide">TekhPoints</h2>
            <p className="text-sm md:text-[15px]">
              Les TekhPoints sont des crédits TEKH+ utilisables sur votre prochain échange ou achat. Ils sont
              valables 6 mois et peuvent couvrir jusqu&apos;à 30 % de la valeur d&apos;une prochaine transaction.
              Aucun remboursement en espèces n&apos;est effectué.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PolitiqueEchangeTekhPoints;
