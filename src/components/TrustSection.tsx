import trust1 from "@/assets/20251112_1136_Jeunes Africains Connectés_simple_compose_01k9vxh5dyfd5s2gh9vb3sxph7.png";
import trust2 from "@/assets/20251112_1136_Jeunes Africains Connectés_simple_compose_01k9vxh5dzfb18btx0w82v93d0.png";

const TrustSection = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-subtle relative">
      <div className="absolute inset-0 bg-gradient-glow opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Satisfaction & <span className="bg-gradient-hero bg-clip-text text-transparent">Confiance</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des échanges sécurisés, transparents et responsables.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-2xl opacity-40"></div>
            <img
              src={trust1}
              alt="Satisfaction des utilisateurs"
              className="relative rounded-2xl border border-border/50 shadow-card-hover w-full max-w-md md:max-w-lg h-auto mx-auto object-cover"
              loading="lazy"
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-2xl opacity-40"></div>
            <img
              src={trust2}
              alt="Confiance de la communauté"
              className="relative rounded-2xl border border-border/50 shadow-card-hover w-full max-w-md md:max-w-lg h-auto mx-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
