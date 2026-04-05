import { useGoToFooter } from "@/shared/hooks/useGoToFooter";
import { ChevronLeft, Coins, ArrowUpDown } from "lucide-react";

/**
 * Contenu aligné sur la charte métier TEKH+ (Section 9).
 */
const PolitiqueEchangeTekhPoints = () => {
  const goToFooter = useGoToFooter();
  return (
    <main className="pt-20 sm:pt-24 pb-32 sm:pb-16 bg-white dark:bg-black text-black dark:text-white min-h-dvh scroll-pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => goToFooter()}
          className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>

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
          <p className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-zinc-900/40 p-5 shadow-sm">
            Chez TEKH+, tous les échanges sont calculés de manière transparente via notre algorithme de
            valorisation (PRT, VRT, TekhPoints). Sur mobile, un espace vide en bas de page évite que la barre
            de navigation recouvre le texte.
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
              Vous visez un appareil <strong>moins cher</strong> que la valeur de reprise de votre téléphone
              actuel : la différence ne constitue pas un « remboursement » en espèces. Si l&apos;écart est
              <strong> inférieur ou égal à 15 000 FCFA</strong>, TEKH+ peut l&apos;<strong>absorber</strong> selon
              la charte en vigueur. Au-delà, le reliquat est crédité en <strong>TekhPoints</strong> (pas de
              cash-out), utilisables sur une prochaine transaction dans la limite des règles de plafond.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-3 bg-amber-50/50 dark:bg-amber-950/20">
            <h2 className="text-lg font-black uppercase tracking-wide text-amber-900 dark:text-amber-200">
              PRT &amp; VRT (rappel)
            </h2>
            <p className="text-sm md:text-[15px] text-slate-800 dark:text-zinc-200">
              <strong>PRT</strong> (Prix de Référence TEKH) : valeur catalogue de référence pour le modèle.
              <strong> VRT</strong> (Valeur Réelle de Transaction) : valeur après application des coefficients
              (âge, état, batterie, écran, châssis, etc.). C&apos;est la VRT qui sert au calcul de votre
              apport et du swap.
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
