import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeCarousel } from "@/features/home/HomeCarousel";
import { HeaderCarousel } from "@/features/home/HeaderCarousel";
import DealsSection from "@/features/marketplace/DealsSection";
import ServicesSection from "@/features/home/ServicesSection";
import FAQSection from "@/features/home/FAQSection";
import WhyTekh from "@/features/home/WhyTekh";
import ExchangeProcess from "@/features/home/ExchangeProcess";
import CtaSection from "@/features/home/CtaSection";
import HowItWorks from "@/features/home/HowItWorks";
import WebSwapStory from "@/features/home/WebSwapStory";
import { Zap, Search, ShieldCheck, MessageCircle } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";
import { buildWhatsAppUrl } from "@/core/utils/whatsapp";

const QuickActions = () => {
  const navigate = useNavigate();
  const isPWA = usePWA();
  const actions = [
    { label: "Estimer", icon: <Zap className="w-6 h-6" />, path: "/simulateur", color: "bg-[#064e3b]" },
    { label: "Explorer", icon: <Search className="w-6 h-6" />, path: "/deals", color: "bg-[#064e3b]" },
    { label: "Certifié", icon: <ShieldCheck className="w-6 h-6" />, path: "/charte-qualite", color: "bg-[#064e3b]" },
  ];

  return (
    <section className="px-6 -mt-10 relative z-20 md:hidden">
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 md:w-16 md:h-16 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-active:scale-90 transition-transform text-white`}>
              {action.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground opacity-80">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

const Index = () => {
  const isPWA = usePWA();
  const whatsappHref = buildWhatsAppUrl("Bonjour TEKH+, je souhaite obtenir de l'aide pour la réparation de mon appareil.") || "/contact";

  return (
    <main className={`landing-page bg-background pb-20 ${!isPWA ? "pt-0" : ""}`}>
      {isPWA ? (
        /* VUE PWA — header déjà pleine largeur, contenu fluide */
        <div className="space-y-0">
          <section className="w-full min-h-[50vh] md:min-h-[55vh]">
            <HomeCarousel />
          </section>
          <div className="px-4 sm:px-6">
            <QuickActions />
            <ServicesSection />
            <DealsSection />
            <FAQSection />
          </div>
        </div>
      ) : (
        /* VUE SITE WEB — éditorial, navy / vert profond / blanc */
        <>
          <HeaderCarousel />
          <WebSwapStory />
          <HowItWorks />
          <WhyTekh />
          <DealsSection />
          <ExchangeProcess />
          <ServicesSection />
          <FAQSection />
          <CtaSection />
        </>
      )}
      <a
        href={whatsappHref}
        target={whatsappHref.startsWith("http") ? "_blank" : undefined}
        rel={whatsappHref.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label="Contacter TEKH+ sur WhatsApp"
        title="Contacter TEKH+ sur WhatsApp"
        className="fixed bottom-6 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 focus-visible:ring-[#25D366]"
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2.25} />
      </a>
    </main>
  );
};

export default Index;
