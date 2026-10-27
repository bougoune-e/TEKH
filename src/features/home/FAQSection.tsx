import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection = () => {
  const { t } = useTranslation();
  const faqs = t("faq.items", { returnObjects: true }) as FAQItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#064e3b]/5 dark:bg-[#00FF41]/10 border border-[#064e3b]/10 dark:border-[#00FF41]/20 mb-4">
            <HelpCircle className="w-4 h-4 text-[#064e3b] dark:text-[#00FF41]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b] dark:text-[#00FF41]">
              {t("faq.badge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0a0a0a] dark:text-white mb-4 tracking-tighter">
            {t("faq.title")}
          </h2>
          <p className="text-[#404040] dark:text-zinc-400 font-bold max-w-xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-base md:text-lg text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-sm md:text-base text-muted-foreground border-t border-zinc-100/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/10 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
