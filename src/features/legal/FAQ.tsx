import { ChevronLeft, HelpCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function FAQ() {
    const { t } = useTranslation();
    const faqs = t("faq.items", { returnObjects: true }) as Array<{ question: string; answer: string }>;;
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="min-h-dvh bg-white dark:bg-black text-black dark:text-white pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-primary font-black mb-8 hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="h-5 w-5" />
                    {t("faq.back")}
                </Link>

                <header className="mb-12">
                    <div className="h-16 w-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <HelpCircle className="h-8 w-8 text-white dark:text-black" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">{t("faq.helpTitle")}</h1>
                    <p className="text-muted-foreground font-bold leading-relaxed">{t("faq.helpSubtitle")}</p>
                </header>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-border rounded-2xl overflow-hidden shadow-sm transition-all">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                aria-expanded={openIndex === i}
                                className="w-full p-6 text-left flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900"
                            >
                                <span className="font-black text-xl">{faq.question}</span>
                                {openIndex === i ? <Minus className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            </button>
                            {openIndex === i && (
                                <div className="p-6 bg-white dark:bg-black border-t border-border font-bold leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
