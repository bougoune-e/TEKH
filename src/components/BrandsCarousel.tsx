import iphone from "../../assets/illustrations/homepage/iphone.jpeg";
import samsung from "../../assets/illustrations/homepage/samsungA35.jpeg";
import huawei from "../../assets/illustrations/homepage/huawei.jpeg";
import xiaomi from "../../assets/illustrations/homepage/xiaomi.jpeg";
import oneplus from "../../assets/illustrations/homepage/oneplus.jpeg";
import oppo from "../../assets/illustrations/homepage/oppo.jpeg";
import tecno from "../../assets/illustrations/homepage/tecno.jpeg";
import infinix from "../../assets/illustrations/homepage/infinix.jpeg";
import pixel from "../../assets/illustrations/homepage/google_pixel.jpeg";
import vivo from "../../assets/illustrations/homepage/vivo.jpeg";

const items = [
  { src: iphone, label: "Apple iPhone" },
  { src: samsung, label: "Samsung Galaxy" },
  { src: huawei, label: "Huawei" },
  { src: xiaomi, label: "Xiaomi" },
  { src: oneplus, label: "OnePlus" },
  { src: oppo, label: "OPPO" },
  { src: tecno, label: "TECNO" },
  { src: infinix, label: "Infinix" },
  { src: pixel, label: "Google Pixel" },
  { src: vivo, label: "vivo" },
];

const BrandsCarousel = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Marques et smartphones</h2>

        {/* Masonry-like responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((it) => (
            <figure key={it.label} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card-hover">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={it.src} alt={it.label} className="w-full h-full object-cover group-hover:scale-[1.03] transition-smooth" />
                <figcaption className="absolute bottom-0 left-0 right-0 bg-background/70 backdrop-blur px-3 py-2 text-sm font-medium">
                  {it.label}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsCarousel;
