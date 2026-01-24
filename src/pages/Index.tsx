import Hero from "@/components/Hero";
import DealsSection from "@/components/DealsSection";
import HowItWorks from "@/components/HowItWorks";
import AboutSection from "@/components/AboutSection";
import BrandsCarousel from "@/components/BrandsCarousel";
import AllBrands from "@/components/AllBrands";
import TrustSection from "@/components/TrustSection";
import RepairSection from "@/components/RepairSection";
import MessagingSection from "@/components/MessagingSection";
import ExchangeCriteria from "@/components/ExchangeCriteria";

const Index = () => {
  return (
    <>
      <Hero />
      <DealsSection />
      <ExchangeCriteria />
      <BrandsCarousel />
      <AllBrands />
      <TrustSection />
      <MessagingSection />
      <RepairSection />
      <HowItWorks />
      <AboutSection />
    </>
  );
};

export default Index;
