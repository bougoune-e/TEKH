import { ArrowRight, Recycle, ShieldCheck, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const WebSwapStory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = t("home.story.steps", { returnObjects: true }) as Array<{ title: string; body: string }>;;
  const pillars = [
    { n: "01", icon: Smartphone, ...steps[0] },
    { n: "02", icon: Recycle, ...steps[1] },
    { n: "03", icon: ShieldCheck, ...steps[2] },
  ];

  return (
    <section className="relative bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[hsl(var(--tekh-green))]" aria-hidden="true" />

      <div className="container mx-auto px-6 lg:px-16 py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end mb-16 md:mb-20">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--tekh-green))]">
              {t("home.story.eyebrow")}
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-[hsl(var(--tekh-navy))] dark:text-zinc-50 leading-[1.08]">
              {t("home.story.title")}
              <span className="block italic font-medium text-[hsl(var(--tekh-green))]">
                {t("home.story.titleAccent")}
              </span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base md:text-lg text-[hsl(var(--tekh-navy))]/65 dark:text-zinc-300 leading-relaxed max-w-md font-normal">
              {t("home.story.description")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/simulateur")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--tekh-green))] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition-all hover:-translate-y-0.5 hover:bg-[hsl(142_76%_30%)]"
            >
              {t("home.story.cta")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[2rem] md:grid-cols-3 gap-px bg-[hsl(var(--tekh-navy))]/10 dark:bg-white/10 border border-[hsl(var(--tekh-navy))]/10 dark:border-white/10 shadow-[0_18px_50px_-30px_hsl(var(--tekh-navy)/0.3)]">
          {pillars.map(({ n, icon: Icon, title, body }) => (
            <article
              key={n}
              className="bg-white dark:bg-zinc-900 p-8 md:p-10 space-y-5 hover:bg-[hsl(142_30%_97%)] dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-display italic text-3xl text-[hsl(var(--tekh-green))]">{n}</span>
                <Icon className="w-6 h-6 text-[hsl(var(--tekh-navy))] dark:text-zinc-200" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-[hsl(var(--tekh-navy))] dark:text-zinc-50 leading-snug">
                {title}
              </h3>
              <p className="text-sm md:text-[15px] text-[hsl(var(--tekh-navy))]/65 dark:text-zinc-300 leading-relaxed font-medium">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WebSwapStory;
