import logo from "../../assets/logos/robot.png";

const Apk = () => {
  return (
    <main className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-emerald-900 text-emerald-50 p-6 md:p-10 mb-8 flex items-center gap-4">
          <img src={logo} alt="Tekh" className="h-8 w-8 md:h-10 md:w-10 brightness-0 invert" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Télécharger l'APK</h1>
            <p className="text-emerald-100/90 text-sm md:text-base">Installateur Android officiel de Tekh.</p>
          </div>
        </div>

        <p className="text-muted-foreground mb-4">Lien de téléchargement direct à intégrer ici.</p>
        <a
          href="#"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground"
        >
          Télécharger
        </a>
      </div>
    </main>
  );
};

export default Apk;
