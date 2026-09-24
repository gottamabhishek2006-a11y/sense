import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import IssueCard from '../components/IssueCard';
import {
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  LogIn,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  ThumbsUp,
  Activity,
  Users,
  Building2,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

const LandingPage = () => {
  const { onOpenReportModal, recentIssues } = useOutletContext();
  const { isAuthenticated, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIssues =
    selectedCategory === 'All'
      ? recentIssues
      : recentIssues.filter((i) => i.category === selectedCategory);

  const steps = [
    {
      step: '01',
      title: 'Spot & Snap',
      desc: 'Encounter a pothole, broken streetlight, or garbage dump? Take a photo and capture the details in seconds.',
      icon: Camera,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      step: '02',
      title: 'Geotag & Submit',
      desc: 'Our platform automatically pins your civic ward and dispatches the complaint directly to the responsible municipal department.',
      icon: MapPin,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      step: '03',
      title: 'Track in Real-Time',
      desc: 'Watch your complaint transition from "Under Review" to "In Progress" with assigned crew notifications.',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      step: '04',
      title: 'Verified Resolution',
      desc: 'City crew uploads the fixed proof photo. The issue is officially closed with community sign-off.',
      icon: CheckCircle,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
  ];

  const features = [
    {
      title: 'Easy Complaint Reporting',
      description:
        'Submit civic complaints in under 60 seconds with intuitive category pickers, smart location geotagging, and photo attachments.',
      icon: PlusCircle,
      badge: 'Fast & Intuitive',
    },
    {
      title: 'Real-Time Complaint Tracking',
      description:
        'Stay informed at every phase with live status updates, crew assignment alerts, and dispatch milestones directly from city authorities.',
      icon: Activity,
      badge: 'Live Status',
    },
    {
      title: 'Transparent Resolution Updates',
      description:
        'Eliminate bureaucratic black holes. View public work orders, repair timestamps, and technician completion reports openly.',
      icon: CheckCircle,
      badge: 'Accountable',
    },
    {
      title: 'Community Participation',
      description:
        'Upvote urgent neighborhood issues to escalate repair priority. Collaborate with fellow residents to improve ward safety.',
      icon: Users,
      badge: 'Civic Power',
    },
  ];

  const stats = [
    { value: '14,850+', label: 'Civic Issues Resolved', icon: CheckCircle },
    { value: '98.4%', label: 'Municipal Resolution Rate', icon: Activity },
    { value: '2.4 hrs', label: 'Average Dispatch Time', icon: Clock },
    { value: '48 Wards', label: 'Smart City Coverage', icon: Building2 },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-transparent blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart City Civic Engagement Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Report Problems.{' '}
              <span className="civic-gradient-text block sm:inline">
                Build a Better Community.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CivicFix connects residents directly with municipal departments to report neighborhood issues—from potholes to broken streetlights—and track repairs with transparent, real-time updates.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                id="hero-report-btn"
                onClick={onOpenReportModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Report an Issue</span>
              </button>

              {!isAuthenticated ? (
                <>
                  <Link
                    id="hero-get-started-btn"
                    to="/get-started"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all hover:-translate-y-0.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                  </Link>

                  <Link
                    id="hero-login-btn"
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
                  >
                    <LogIn className="w-4 h-4 text-slate-500" />
                    <span>Login</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
                >
                  <span>Go to My Dashboard ({user?.name?.split(' ')[0]})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Quick Trust badges */}
            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>No App Download Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified City Response</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Civic Preview Card */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-2 text-xs font-mono text-slate-400">
                  civicfix.gov/live-dispatch/ward-08
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Municipal Feed
              </span>
            </div>

            <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                    High Priority
                  </span>
                  <span className="text-xs text-slate-500">Ticket #CFX-9012</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Major Water Pipe Burst on Commercial Boulevard
                </h3>
                <p className="text-sm text-slate-600">
                  Dispatched to City Water Works division. Field crew arrived on site with excavation equipment. Water valve shut off successfully.
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Ward 8, Boulevard & 2nd St.
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Updated 12 mins ago
                  </span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Resolution Progress
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Reported by Citizen</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Dispatched to Dept</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold animate-pulse">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Crew On Site Repairing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                    <span>Quality Sign-off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS IMPACT BAR */}
      <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 text-white">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 font-medium">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CivicFix Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From reporting an issue on your phone to verified municipal repair, every step is streamlined, transparent, and tracked in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors">
                      {st.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${st.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Empowering Modern Cities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Core Features Built for Citizens & Municipalities
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to transform public complaints into actionable municipal work orders with complete accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm hover:shadow-lg transition-all duration-200 space-y-4 hover:border-emerald-300"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* LIVE ISSUE TRACKER FEED (SAMPLE & RECENT COMPLAINTS) */}
      <section id="live-tracker" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Neighborhood Watch
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Live Civic Issue Tracker
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Browse recent community complaints and upvote priority fixes in your ward.
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Roads', 'Lighting', 'Water', 'Sanitation'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>

        {/* Action prompt below tracker */}
        <div className="mt-8 text-center bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-emerald-950">
              Notice a hazard or maintenance issue on your commute?
            </h4>
            <p className="text-xs text-emerald-700">
              Don't wait for someone else. Report it in seconds and get notified when it's fixed.
            </p>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm shadow-emerald-600/20"
          >
            Report This Now
          </button>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Make Your Neighborhood Cleaner and Safer?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Join thousands of proactive citizens already improving our city. Sign up in under a minute or report an urgent problem immediately.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={onOpenReportModal}
                className="px-6 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5"
              >
                Report an Issue
              </button>
              <Link
                to="/get-started"
                className="px-6 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-400 text-white font-bold text-sm transition-transform hover:-translate-y-0.5"
              >
                Create Free Citizen Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
