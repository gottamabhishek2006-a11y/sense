import React from 'react';
import { Leaf, Heart, ArrowUp } from 'lucide-react';

export default function CivicFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    { name: 'About', href: '#why-it-matters' },
    { name: 'Challenges', href: '#challenges' },
    { name: 'Community', href: '#community' },
    { name: 'Contact', href: '#contact' },
    { name: 'Privacy', href: '#privacy' },
  ];

  const handleLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-[#07110c]/80 backdrop-blur-md border-t border-emerald-900/30 text-slate-400 py-16 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-[#1f3528]">
          {/* Brand */}
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black tracking-wider text-white">
                CIVIC <span className="text-emerald-400 font-light">SENSE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Building cleaner, safer and more responsible communities.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-slate-300 hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded px-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl transition-all hover:-translate-y-0.5"
            aria-label="Scroll to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Copyright & Subtext */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Civic Sense. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Powered by conscious citizen collaboration & natural living worlds</span>
            <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
