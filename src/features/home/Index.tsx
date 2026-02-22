import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeCarousel } from "@/features/home/HomeCarousel";
import DealsSection from "@/features/marketplace/DealsSection";
import MessagingSection from "@/features/marketplace/MessagingSection";
import RepairSection from "@/features/marketplace/RepairSection";
import Hero from "@/features/home/Hero";
import ServicesSection from "@/features/home/ServicesSection";
import WhyTekh from "@/features/home/WhyTekh";
import ExchangeProcess from "@/features/home/ExchangeProcess";
import { Zap, Search, ShoppingBag, ShieldCheck } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";

const QuickActions = () => {
  const navigate = useNavigate();
  const isPWA = usePWA();
  const actions = [
    { label: "Estimer", icon: <Zap className="w-6 h-6" />, path: "/simulateur", color: isPWA ? "bg-[#00FF41]" : "bg-amber-500" },
    { label: "Explorer", icon: <Search className="w-6 h-6" />, path: "/deals", color: isPWA ? "bg-[#00FF41]" : "bg-blue-500" },
    { label: "Certifié", icon: <ShieldCheck className="w-6 h-6" />, path: "/charte-qualite", color: isPWA ? "bg-[#00FF41]" : "bg-purple-500" },
  ];

  return (
    <section className="px-4 -mt-10 relative z-20 md:hidden">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`w-14 h-14 md:w-16 md:h-16 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-active:scale-90 transition-transform ${isPWA ? 'text-black' : 'text-white'}`}>
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

  return (
    <main className={`bg-background pb-20 ${!isPWA ? 'pt-0' : ''}`}>
      {isPWA ? (
        /* VUE PWA / MOBILE NATIVE APP - ULTRA ÉPURÉE */
        <div className="space-y-0">
          <HomeCarousel />
          <QuickActions />
          <ServicesSection />
          <DealsSection />
        </div>
      ) : (
        /* VUE SITE WEB CLASSIQUE */
        <>
          <Hero />
          <ServicesSection />
          <WhyTekh />
          <DealsSection />
          <ExchangeProcess />
          <div className="container mx-auto px-4 py-8 space-y-12">
            <MessagingSection />
            <RepairSection />
          </div>
        </>
      )}
    </main>
  );
};

export default Index;
