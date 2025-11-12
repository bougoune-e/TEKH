import accueil2 from "@/assets/accueil.png";

const AccueilGallery = () => {
  return (
    <section className="py-12 md:py-16 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="relative group w-full max-w-md md:max-w-lg">
            <div className="absolute inset-0 bg-gradient-accent opacity-20 blur-2xl rounded-2xl"></div>
            <img
              src={accueil2}
              alt="Échange de smartphones - visuel d'accueil"
              className="relative rounded-2xl border border-border/50 shadow-card-hover w-full h-auto mx-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccueilGallery;
