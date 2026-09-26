import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Leaf,
  Menu,
  X,
  ArrowRight,
  User,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function CivicNavbar({ onOpenReportModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Why It Matters', href: '#why-it-matters' },
    { name: 'Take Action', href: '#take-action' },
    { name: 'Challenges', href: '#challenges' },
    { name: 'Community', href: '#community' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#15231c]/90 backdrop-blur-md border-b border-[#2d4d3c]/50 shadow-lg shadow-black/20 py-3.5'
          : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent backdrop-blur-[2px] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg p-1"
            aria-label="Civic Sense Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform duration-200 border border-emerald-400/30">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider text-white drop-shadow-sm flex items-center gap-1.5 font-sans">
                CIVIC <span className="text-emerald-400 font-light">SENSE</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-emerald-200/80 font-medium -mt-1 hidden sm:block">
                Living Communities
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA & User Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-white transition-all text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 backdrop-blur-md"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[11px]">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate font-medium text-slate-200">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#1b2b23] border border-emerald-500/20 rounded-xl shadow-2xl py-1.5 z-50 text-slate-200 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-emerald-500/10">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-emerald-300/70 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-emerald-800/30 text-slate-200 hover:text-white"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-emerald-800/30 text-slate-200 hover:text-white"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-emerald-200 hover:text-white px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/signup"
              id="nav-join-movement-btn"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full font-bold text-xs text-slate-950 bg-[#48d597] hover:bg-[#3ec48a] shadow-md shadow-emerald-900/30 hover:shadow-emerald-700/40 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Join the Movement</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 mx-4 p-4 rounded-2xl bg-[#14231b]/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-3 space-y-2">
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-950 bg-gradient-to-r from-emerald-300 to-teal-300 hover:opacity-90 shadow-md"
            >
              Join the Movement
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
