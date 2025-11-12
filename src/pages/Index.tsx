import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DealsSection from "@/components/DealsSection";
import HowItWorks from "@/components/HowItWorks";
import Charte from "@/components/Charte";
import Simulator from "@/components/Simulator";
import Footer from "@/components/Footer";
import BrandsStrip from "@/components/BrandsStrip";
import AccueilGallery from "@/components/AccueilGallery";
import TrustSection from "@/components/TrustSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BrandsStrip />
      <AccueilGallery />
      <TrustSection />
      <DealsSection />
      <HowItWorks />
      <Charte />
      <Simulator />
      <Footer />
    </div>
  );
};

export default Index;
