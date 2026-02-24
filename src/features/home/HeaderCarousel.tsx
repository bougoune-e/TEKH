import React from "react";

const HEADER_IMAGES = ["/header/header-1.png", "/header/header-2.png", "/header/header-3.png"];

/**
 * Bandeau header web : 3 photos en défilement horizontal fluide (CSS marquee).
 */
export const HeaderCarousel = () => {
  return (
    <section className="relative w-full h-[38vh] min-h-[260px] max-h-[380px] overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/70 via-transparent to-[#0a1628]/80 z-10 pointer-events-none" />
      <div className="header-marquee absolute inset-0 flex items-stretch">
        <div className="header-marquee__track">
          {[...HEADER_IMAGES, ...HEADER_IMAGES].map((src, i) => (
            <div key={`${src}-${i}`} className="header-marquee__slide">
              <img src={src} alt="" className="header-marquee__img" />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .header-marquee { mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
        .header-marquee__track {
          display: flex;
          align-items: stretch;
          height: 100%;
          width: max-content;
          animation: header-marquee 45s linear infinite;
        }
        .header-marquee:hover .header-marquee__track { animation-play-state: paused; }
        .header-marquee__slide {
          flex-shrink: 0;
          width: 85vw;
          max-width: 520px;
          height: 100%;
          padding: 0 0.5rem;
        }
        .header-marquee__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
        @keyframes header-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </section>
  );
};
