import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Simulator from "@/components/Simulator";
import BackHomeButton from "@/components/BackHomeButton";
import BackBar from "@/components/BackBar";
import Breadcrumbs from "@/components/Breadcrumbs";

const SimulatorPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BackBar />
      <Breadcrumbs />
      <section className="pb-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Simulateur</h1>
          <Simulator />
        </div>
      </section>
      <BackHomeButton />
      <Footer />
    </div>
  );
};

export default SimulatorPage;
