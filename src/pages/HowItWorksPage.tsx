import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import BackHomeButton from "@/components/BackHomeButton";
import BackBar from "@/components/BackBar";
import Breadcrumbs from "@/components/Breadcrumbs";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BackBar />
      <Breadcrumbs />
      <section className="pt-0 md:pt-0 pb-12 bg-gradient-subtle">
        <HowItWorks />
      </section>
      <BackHomeButton />
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
