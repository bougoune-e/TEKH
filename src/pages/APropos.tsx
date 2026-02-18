import AboutSection from "@/components/AboutSection";

const APropos = () => {
  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">À propos</h1>
        <p className="text-muted-foreground mb-10 max-w-3xl">
          Découvrez la mission, la vision et les engagements de TΞKΗ+.
        </p>
      </div>
      <AboutSection />
    </main>
  );
};

export default APropos;
