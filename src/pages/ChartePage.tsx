import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Charte from "@/components/Charte";
import BackHomeButton from "@/components/BackHomeButton";
import BackBar from "@/components/BackBar";
import Breadcrumbs from "@/components/Breadcrumbs";

const ChartePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BackBar />
      <Breadcrumbs />
      <section className="pt-0 md:pt-0 pb-12 bg-gradient-subtle">
        <Charte />
      </section>
      <BackHomeButton />
      <Footer />
    </div>
  );
};

export default ChartePage;
