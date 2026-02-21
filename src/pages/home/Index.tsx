import Hero from "@/components/features/hero/Hero";
import DealsSection from "@/components/features/deals/DealsSection";
import HowItWorks from "@/components/features/hero/HowItWorks";
import AboutSection from "@/components/features/hero/AboutSection";
import RepairSection from "@/components/features/deals/RepairSection";
import MessagingSection from "@/components/features/deals/MessagingSection";
import ExchangeCriteria from "@/components/features/deals/ExchangeCriteria";
import ExchangeProcess from "@/components/features/hero/ExchangeProcess";

const Index = () => {
  return (
    <>
      <Hero />
      <DealsSection />
      <ExchangeCriteria />
      <MessagingSection />
      <RepairSection />
      <ExchangeProcess />
    </>
  );
};

export default Index;
