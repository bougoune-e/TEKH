import Hero from "@/components/Hero";
import DealsSection from "@/components/DealsSection";
import HowItWorks from "@/components/HowItWorks";
import AboutSection from "@/components/AboutSection";
import RepairSection from "@/components/RepairSection";
import MessagingSection from "@/components/MessagingSection";
import ExchangeCriteria from "@/components/ExchangeCriteria";
import ExchangeProcess from "@/components/ExchangeProcess";

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
