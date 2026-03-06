'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import BookingForm from '@/components/BookingForm';
import ContactForm from '@/components/ContactForm';
import ServiceCard from '@/components/ServiceCard';
import { Pricing } from '@/lib/data';

export default function Home() {
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricings();
  }, []);

  const fetchPricings = async () => {
    try {
      const response = await fetch('/api/pricing');
      const data = await response.json();
      setPricings(data);
    } catch (error) {
      console.error('Failed to fetch pricings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-zinc-900 to-black">
      {/* Hero Section */}
      <section id="home" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[rgba(244,204,126,0.10)] rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[rgba(244,204,126,0.10)] rounded-full blur-3xl animate-float delay-200"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            Pándi Travel
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-8 rounded-full animate-fade-in delay-100"></div>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-6 leading-relaxed animate-fade-in delay-200">
            Üdvözöljük a Pándi Travel oldalon! Személyszállító sofőr szolgáltatásunkkal <span className="text-[rgb(244,204,126)] font-semibold">PRÉMIUM környezetben</span> szállítjuk ügyfeleinket az Ön által meghatározott pontos helyre/címre!
          </p>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed animate-fade-in delay-300">
            Kényelmes, csendes, biztonságos, mindent igényt kielégítő <span className="text-[rgb(244,204,126)] font-semibold">Tesla Model 3-as</span> autóval utazva adjuk át Önnek az utazás élményét! BELFÖLDÖN és KÜLFÖLDÖN egyaránt vállalunk személyszállító sofőr szolgáltatást, előre megbeszélt áron és időben - vagy akár azonnali szükség esetén is!
          </p>
          
          <button
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-10 bg-[rgb(244,204,126)] text-black px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-[rgba(244,204,126,0.40)] transition-all transform hover:scale-105 animate-fade-in delay-400"
          >
            Foglaljon most!
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-effect rounded-3xl p-8 md:p-12 border-[rgba(244,204,126,0.30)] animate-fade-in hover:shadow-2xl hover:shadow-[rgba(244,204,126,0.20)] transition-all duration-500">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">
            Rólunk
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-slate-300 leading-relaxed text-center max-w-4xl mx-auto">
            A Pándi Travel egy <span className="text-[rgb(244,204,126)] font-semibold">PRÉMIUM személyszállítással</span> foglalkozó sofőrszolgálat, aminek célja a maximális biztonság mellett - Ügyfeleink elégedettségének elérése, megítélése! A teljesen elektromos járművel átadjuk a csendes, nyugodt, kiszámítható utazás élményét környezetbarát módon, figyelve az Ügyfeleink visszajelzéseire!
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-4 text-center animate-fade-in">
          Szolgáltatások
        </h2>
        <div className="h-1 w-24 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-12 rounded-full animate-fade-in"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <ServiceCard
            title="Rugalmas és biztonságos utazási lehetőségek"
            description="Sofőrszolgáltatásunk a hét MINDEN NAPJÁN elérhető, akár előre egyeztetett - akár azonnali szükség esetén igénybevehető! Kérjük ügyfeleinket, lehetőség szerint e-mailben vagy telefonon előre egyeztetve keressék sofőr szolgáltatásunkat!"
          />

          <ServiceCard
            title="VIP transzfer szolgáltatás"
            description="A Tesla transzfer lehetővé teszi, hogy környezetbarát módon utazhass és élvezhesd a modern technológia előnyeit, csendes környezetben és tisztaságban! A VIP transzfer szolgáltatás lehetővé teszi, hogy kényelmesen és stílusosan érkezzünk úti célunkhoz, akár várakozásról, akár oda-vissza útról legyen szó!"
          />

          <ServiceCard
            title="Utazási tanácsadás Teslával"
            description="Kényelmes, csendes, biztonságos, mindent igényt kielégítő Tesla Model 3-as autóval utazva adjuk át Önnek az utazás élményét! BELFÖLDÖN és KÜLFÖLDÖN egyaránt vállalunk személyszállító sofőr szolgáltatást, előre megbeszélt áron és időben - vagy akár azonnali szükség esetén is!"
          />

          <ServiceCard
            title="Árlista"
            description="Utazásaink árát előre meghatározott tarifán számoljuk, amiket feltüntetünk több fórumon is! Alapdíjból és Km/viteldíjból határozzuk meg a személyszállítási fuvar teljes költségét, amit már indulás előtt az Ügyfél tudtára adunk! Ezáltal kiszámíthatóan és pontosan, váratlan kiadás nélkül igyekszünk minden Ügyfelünket biztosítani és kielégíteni már az úticél elérését megelőzően! :)"
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {!loading && pricings.length > 0 && (
          <div>
            <h2 className="text-4xl font-bold text-white mb-4 text-center animate-fade-in">
              Díjak és Tariffák
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-12 rounded-full animate-fade-in"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pricings.map((pricing, index) => (
                <div
                  key={pricing.id}
                  className="glass-effect rounded-2xl p-8 border border-[rgba(244,204,126,0.30)] hover:border-[rgb(244,204,126)] transition-all duration-300 hover:shadow-2xl hover:shadow-[rgba(244,204,126,0.20)] hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-bold text-white">{pricing.name}</h4>
                    <div className="w-12 h-12 bg-gradient-to-br from-[rgb(244,204,126)] to-[rgb(244,204,126)] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  {pricing.description && (
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">{pricing.description}</p>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-400 font-medium">Alapdíj:</span>
                      <span className="text-[rgb(244,204,126)] font-bold text-lg">{pricing.basePrice.toLocaleString('hu-HU')} Ft</span>
                    </div>
                    {pricing.pricePerKm > 0 && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-400 font-medium">Km díj:</span>
                        <span className="text-[rgb(244,204,126)] font-bold text-lg">{pricing.pricePerKm} Ft/km</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Booking Form Section */}
      <section id="booking" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center animate-fade-in">
            Foglalás
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-12 rounded-full animate-fade-in"></div>
          <div className="glass-effect rounded-2xl p-8 border border-[rgba(244,204,126,0.30)]">
            <BookingForm pricings={pricings} onSuccess={fetchPricings} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center animate-fade-in">Kapcsolat</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-[rgb(244,204,126)] to-[rgb(244,204,126)] mx-auto mb-12 rounded-full animate-fade-in"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left side: Logo + Contact Info */}
            <div className="space-y-8 animate-fade-in lg:self-start">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-80 h-80 bg-black p-0">
                  <Image
                    src="/logo.jpeg"
                    alt="Pándi Travel logó"
                    fill
                    className="object-contain"
                    sizes="320px"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {/* Cím */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">Cím</p>
                  <a 
                    href="https://www.google.com/maps/place/2370+Dabas,+Wesselenyi+utca" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white text-lg font-semibold hover:text-[rgb(244,204,126)] transition-colors block"
                  >
                    2370 Dabas, Wesselényi utca
                  </a>
                </div>

                {/* Telefon */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">Telefon</p>
                  <a 
                    href="tel:+36209282626" 
                    className="text-white text-lg font-semibold hover:text-[rgb(244,204,126)] transition-colors block"
                  >
                    +36-20-928-2626
                  </a>
                </div>

                {/* Email */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">Email</p>
                  <a 
                    href="mailto:contact@pandi-travel.hu" 
                    className="text-white text-lg font-semibold hover:text-[rgb(244,204,126)] transition-colors block break-all"
                  >
                    contact@pandi-travel.hu
                  </a>
                </div>
              </div>
            </div>

            {/* Right side: Contact Form */}
            <div className="glass-effect rounded-3xl p-8 border border-[rgba(244,204,126,0.30)]">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Írj nekünk</h3>
              <ContactForm />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-12 px-8 py-10 bg-black rounded-2xl mt-12">
            <div className="flex justify-center items-center space-x-6 mb-6">
              <a
                href="https://www.facebook.com/profile.php?id=61579373423666"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="w-12 h-12 bg-[#1877F2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-blue-500/40">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </a>
            </div>
            <p className="text-slate-400 text-sm animate-fade-in">
              © 2026 Pándi Travel. Minden jog fenntartva.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
