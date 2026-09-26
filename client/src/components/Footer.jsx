import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Phone, Mail, MapPin, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      className="text-slate-300 pt-16 pb-12 border-t border-emerald-900/20"
      style={{
        background: 'rgba(10, 22, 17, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-900/20">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Civic<span className="text-emerald-400">Fix</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering proactive citizens and smart city administrations to collaborate, report municipal issues, and build cleaner, safer, more resilient neighborhoods together.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-400">
                Municipal API Dispatch: Operational (99.98% Uptime)
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How CivicFix Works</a>
              </li>
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">Platform Features</a>
              </li>
              <li>
                <a href="#live-tracker" className="hover:text-emerald-400 transition-colors">Issue Tracker</a>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Citizen Portal</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-emerald-400 transition-colors">Register Account</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Civic Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Issue Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Potholes & Road Hazards</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Streetlights & Grid Outages</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Sanitation & Illegal Dumping</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Water Main Leaks</span>
              </li>
              <li>
                <span className="hover:text-emerald-400 cursor-pointer">Public Park Maintenance</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Municipal Hotlines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Emergency Hotlines</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Municipal Services: <strong>311</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Water Emergency: <strong>1-800-CIVIC-H2O</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@civicfix.gov</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>City Hall, Municipal District 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CivicFix Platform. Built with MERN Stack & MongoDB Atlas.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Citizen Charter</a>
            <a href="#" className="hover:text-slate-400 transition-colors">API Documentation</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
