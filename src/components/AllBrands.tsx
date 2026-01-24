const modules = import.meta.glob<{ default: string }>("../../assets/icons/brands/*.svg", { eager: true, import: "default" });

const entries = Object.entries(modules).map(([path, url]) => {
  const name = path.split("/").pop()?.replace(".svg", "") || "";
  return { name, url: url as unknown as string };
});

export default function AllBrands() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Toutes les marques disponibles</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {entries.map((it) => (
            <div key={it.name} className="group bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover p-4 flex items-center justify-center">
              <img src={it.url} alt={it.name} className="max-h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-smooth dark:invert dark:brightness-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
