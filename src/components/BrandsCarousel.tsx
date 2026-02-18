import iphone from "@/assets/illustrations/homepage/iphone.jpeg";
import samsung from "@/assets/illustrations/homepage/samsungA35.jpeg";
import huawei from "@/assets/illustrations/homepage/huawei.jpeg";
import xiaomi from "@/assets/illustrations/homepage/xiaomi.jpeg";
import oneplus from "@/assets/illustrations/homepage/oneplus.jpeg";
import oppo from "@/assets/illustrations/homepage/oppo.jpeg";
import tecno from "@/assets/illustrations/homepage/tecno.jpeg";
import infinix from "@/assets/illustrations/homepage/infinix.jpeg";
import pixel from "@/assets/illustrations/homepage/google_pixel.jpeg";
import vivo from "@/assets/illustrations/homepage/vivo.jpeg";

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
            <figure key={it.label} className="group overflow-hidden rounded-[24px] border-2 border-black/5 dark:border-white/10 bg-card shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={it.src} alt={it.label} className="w-full h-full object-cover group-hover:scale-110 transition-smooth" />
                <figcaption className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 text-sm font-black text-black dark:text-white border-t border-black/5 dark:border-white/10">
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
