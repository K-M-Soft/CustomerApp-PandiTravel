'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-md shadow-lg ${
        !isScrolled ? 'md:bg-transparent md:shadow-none' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 rounded-full px-3 py-2 hover:bg-zinc-800/70 transition-all"
          >
            <span className="relative w-14 h-14 rounded-xl ring-2 ring-[rgba(244,204,126,0.50)] shadow-lg shadow-[rgba(244,204,126,0.20)] bg-black/50 p-1">
              <Image
                src="/logo.jpeg"
                alt="Pándi Travel logó"
                fill
                className="object-contain"
                sizes="56px"
                priority
              />
            </span>
            <span className="text-xl md:text-2xl font-bold text-white hover:text-[rgb(244,204,126)] transition-colors">
              Pándi Travel
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium"
            >
              Kezdőlap
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium"
            >
              Rólunk
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium"
            >
              Szolgáltatások
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium"
            >
              Árak
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium"
            >
              Foglalás
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-[rgb(244,204,126)] text-black px-6 py-2 rounded-full transition-all transform hover:scale-105"
            >
              Kapcsolat
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection('home')}
                className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium text-left py-2"
              >
                Kezdőlap
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium text-left py-2"
              >
                Rólunk
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium text-left py-2"
              >
                Szolgáltatások
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium text-left py-2"
              >
                Árak
              </button>
              <button
                onClick={() => scrollToSection('booking')}
                className="text-slate-300 hover:text-[rgb(244,204,126)] transition-colors font-medium text-left py-2"
              >
                Foglalás
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="bg-[rgb(244,204,126)] text-black px-6 py-3 rounded-full transition-all text-center"
              >
                Kapcsolat
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
