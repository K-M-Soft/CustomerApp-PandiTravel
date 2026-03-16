'use client';

import { useState, useEffect, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';
import img1 from '@/assets/tesla_model3.jpeg';
import img2 from '@/assets/tesla_interior_all_seats.jpeg';
import img3 from '@/assets/tesla_interior_passanger_seat.jpeg';
import img4 from '@/assets/tesla_interior_backseat.jpeg';
import img5 from '@/assets/tesla_interior_wheel.jpeg';

const images: { src: StaticImageData; alt: string }[] = [
  { src: img1, alt: 'Tesla Model 3 külső nézet - Pándi Travel' },
  { src: img2, alt: 'Tesla Model 3 belső - összes ülés' },
  { src: img3, alt: 'Tesla Model 3 utasülés' },
  { src: img4, alt: 'Tesla Model 3 hátsó ülések' },
  { src: img5, alt: 'Tesla Model 3 kormány és műszerfal' },
];

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomed(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoomed(false);
  };

  const goTo = useCallback(
    (direction: 1 | -1) => {
      if (lightboxIndex === null) return;
      setZoomed(false);
      setLightboxIndex((lightboxIndex + direction + images.length) % images.length);
    },
    [lightboxIndex]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(1);
      if (e.key === 'ArrowLeft') goTo(-1);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, goTo]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  return (
    <>
      <section id="gallery" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20" aria-labelledby="gallery-heading">
        <h2 id="gallery-heading" className="text-4xl font-bold text-white mb-4 text-center animate-fade-in">
          Galéria
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-12 rounded-full animate-fade-in" aria-hidden="true" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className={`relative overflow-hidden rounded-2xl border border-[rgba(244,204,126,0.20)] hover:border-[rgb(244,204,126)] transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(244,204,126,0.20)] hover:scale-[1.02] group focus:outline-none focus:ring-2 focus:ring-[rgb(244,204,126)] ${
                i === 0 ? 'col-span-2 md:col-span-2 aspect-video' : 'aspect-square'
              }`}
              aria-label={`Kép megnyitása: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 rounded-full p-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Képnézegető"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            aria-label="Bezárás"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full z-10">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Zoom toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
            className="absolute top-4 right-16 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            aria-label={zoomed ? 'Kicsinyítés' : 'Nagyítás'}
          >
            {zoomed ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            )}
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => { e.stopPropagation(); goTo(-1); }}
            className="absolute left-3 md:left-6 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
            aria-label="Előző kép"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <div
            className={`relative transition-all duration-300 ${
              zoomed
                ? 'w-full h-full cursor-zoom-out'
                : 'w-[90vw] h-[80vh] md:w-[80vw] md:h-[85vh] cursor-zoom-in'
            }`}
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
          >
            <Image
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              fill
              className={`transition-all duration-300 select-none ${zoomed ? 'object-contain' : 'object-contain'}`}
              sizes="100vw"
              priority
              draggable={false}
            />
          </div>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); goTo(1); }}
            className="absolute right-3 md:right-6 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
            aria-label="Következő kép"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Thumbnail strip */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setZoomed(false); setLightboxIndex(i); }}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === lightboxIndex
                    ? 'border-[rgb(244,204,126)] scale-110'
                    : 'border-white/20 hover:border-white/60'
                }`}
                aria-label={`Ugrás a ${i + 1}. képre`}
                aria-current={i === lightboxIndex ? 'true' : 'false'}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
