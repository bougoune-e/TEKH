import apple from "@/assets/Apple iPhone 🍏.jpeg";
import samsung from "@/assets/samsung-logo.jpeg";
import huawei from "@/assets/huawei.jpeg";
import infinix from "@/assets/infinix.jpeg";
import itel from "@/assets/itel.jpeg";
import techno from "@/assets/Techno official logo.jpeg";
import motorola from "@/assets/Motorola logo.jpeg";

const brands = [
  { src: apple, alt: "Apple" },
  { src: samsung, alt: "Samsung" },
  { src: huawei, alt: "Huawei" },
  { src: infinix, alt: "Infinix" },
  { src: itel, alt: "itel" },
  { src: techno, alt: "Tecno" },
  { src: motorola, alt: "Motorola" },
];

const BrandsStrip = () => {
  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-6 items-center">
          {brands.map((b, i) => (
            <div key={i} className="flex justify-center">
              <img
                src={b.src}
                alt={b.alt}
                className="h-8 md:h-10 w-auto object-contain saturate-125 brightness-110 transition-smooth"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsStrip;
