import Hero from "@/features/home/Hero";
import DealsSection from "@/features/marketplace/DealsSection";
import HowItWorks from "@/features/home/HowItWorks";
import AboutSection from "@/features/home/AboutSection";
import RepairSection from "@/features/marketplace/RepairSection";
import MessagingSection from "@/features/marketplace/MessagingSection";
import ExchangeCriteria from "@/features/marketplace/ExchangeCriteria";
import ExchangeProcess from "@/features/home/ExchangeProcess";

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
