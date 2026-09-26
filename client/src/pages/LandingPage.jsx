import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { SylvaLivingWorldScene } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

import CivicNavbar from '../components/CivicNavbar';
import CivicFooter from '../components/CivicFooter';

import {
  Sparkles,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Trash2,
  Recycle,
  Sparkle,
  ShieldCheck,
  VolumeX,
  HeartHandshake,
  Droplets,
  Building,
  Users,
  Compass,
  Check,
  RotateCcw,
  TreePine,
  SunMedium,
  Award,
  AlertCircle
} from 'lucide-react';

// Animated counter component for impact metrics
function Counter({ end, duration = 1800, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className="font-sans font-black tracking-tight tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function LandingPage() {
  const context = useOutletContext();
  const onOpenReportModal = context?.onOpenReportModal;

  // 1. Challenges State (persisted in localStorage)
  const defaultChallenges = [
    {
      id: 'no-litter',
      title: "Don't litter today",
      description: 'Keep all wrappers, bottles, and food containers in your bag until you locate a proper waste bin.',
      icon: Trash2,
      category: 'Cleanliness',
    },
    {
      id: 'use-dustbin',
      title: 'Use a dustbin',
      description: 'Segregate dry recyclables and wet organic waste properly at home and in public places.',
      icon: Recycle,
      category: 'Waste',
    },
    {
      id: 'clean-spaces',
      title: 'Keep public spaces clean',
      description: 'Leave public park benches, bus shelters, and shared desks cleaner than you found them.',
      icon: Sparkles,
      category: 'Surroundings',
    },
    {
      id: 'traffic-rules',
      title: 'Respect traffic rules',
      description: 'Halt behind zebra markings, obey traffic signals, and give right of way to pedestrians.',
      icon: ShieldCheck,
      category: 'Safety',
    },
    {
      id: 'no-honking',
      title: 'Avoid unnecessary honking',
      description: 'Maintain tranquility and preserve quiet zones near hospitals, schools, and residential lanes.',
      icon: VolumeX,
      category: 'Noise',
    },
    {
      id: 'help-others',
      title: 'Help someone in need',
      description: 'Lend an attentive hand to seniors, young children, or persons with disabilities on streets.',
      icon: HeartHandshake,
      category: 'Empathy',
    },
    {
      id: 'save-water',
      title: 'Save water',
      description: 'Turn off unattended public taps and immediately report broken municipal water pipelines.',
      icon: Droplets,
      category: 'Resources',
    },
    {
      id: 'protect-property',
      title: 'Protect public property',
      description: 'Say no to graffiti, poster defacement, or vandalism of city transport and public landmarks.',
      icon: Building,
      category: 'Responsibility',
    },
  ];

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_completed_challenges');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleChallenge = (id) => {
    setCompletedChallenges((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('civic_completed_challenges', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const completedCount = Object.values(completedChallenges).filter(Boolean).length;

  // 2. Interactive Civic Score State
  const quizQuestions = [
    {
      id: 'q1',
      question: 'Do you dispose of waste properly?',
      subtitle: 'Ensuring litter always reaches a designated bin rather than the curb or ground.',
    },
    {
      id: 'q2',
      question: 'Do you follow traffic rules?',
      subtitle: 'Stopping at red lights, respecting pedestrian crossings, and wearing a helmet or seatbelt.',
    },
    {
      id: 'q3',
      question: 'Do you avoid unnecessary littering?',
      subtitle: 'Holding onto snack wrappers and receipts until you find a waste receptacle.',
    },
    {
      id: 'q4',
      question: 'Do you respect public property?',
      subtitle: 'Refraining from defacing walls, breaking street fixtures, or misusing park facilities.',
    },
    {
      id: 'q5',
      question: 'Do you help maintain shared spaces?',
      subtitle: 'Picking up stray trash, closing dripping public taps, or assisting local neighborhood upkeep.',
    },
  ];

  const [answers, setAnswers] = useState({
    q1: 'Always',
    q2: 'Always',
    q3: 'Sometimes',
    q4: 'Always',
    q5: 'Sometimes',
  });

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  // Calculate score out of 100
  const calculateScore = () => {
    const scores = { Always: 20, Sometimes: 12, Rarely: 4 };
    return Object.values(answers).reduce((sum, val) => sum + (scores[val] || 10), 0);
  };

  const currentScore = calculateScore();

  const getScoreMessage = (score) => {
    if (score >= 85) {
      return {
        badge: 'Civic Champion',
        color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
        text: 'Outstanding! Your daily civic habits inspire everyone around you and set the gold standard for your neighborhood.',
      };
    }
    if (score >= 65) {
      return {
        badge: 'Conscious Citizen',
        color: 'text-teal-300 bg-teal-950/60 border-teal-500/30',
        text: 'Great work! You regularly act with awareness. A couple of small consistent habits will elevate your community even further.',
      };
    }
    return {
      badge: 'Emerging Advocate',
      color: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
      text: 'Every positive civic change starts with one small choice today. Choose a single daily challenge to make a lasting difference!',
    };
  };

  const scoreFeedback = getScoreMessage(currentScore);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 4. TRANSPARENT / FLOATING NAVIGATION */}
      <CivicNavbar onOpenReportModal={onOpenReportModal} />

      {/* 3. HERO SECTION */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16"
      >
        {/* Subtle, restrained atmospheric gradient to keep roots and foliage fully visible */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none z-[2]"
          aria-hidden="true"
        />

        {/* Hero Interactive & Layered Content */}
        <div className="hero-content-layer max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10 pt-10 sm:pt-6">
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-md">
            Civic{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ee4a5] via-[#38ef7d] to-[#2ed8b6]">
              Sense
            </span>
          </h1>

          {/* Supporting Heading */}
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight max-w-3xl mx-auto drop-shadow-sm">
            Small actions. Better surroundings. Stronger communities.
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow font-normal">
            Civic sense means taking responsibility for shared public spaces, keeping surroundings clean, respecting others, following public rules, and contributing to a healthier community.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#take-action"
              onClick={(e) => scrollToSection(e, 'take-action')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm text-slate-950 bg-[#48d597] hover:bg-[#3ec48a] shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Take Action</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </a>

            <a
              href="#why-it-matters"
              onClick={(e) => scrollToSection(e, 'why-it-matters')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Civic Sense</span>
              <ArrowDown className="w-4 h-4 text-emerald-300" />
            </a>
          </div>

          {/* Micro scroll indicator */}
          <div className="pt-8 flex flex-col items-center justify-center gap-2 pointer-events-none">
            <span className="tracking-widest uppercase text-[11px] text-[#48d597]/80 font-bold">
              SCROLL THROUGH THE LIVING WORLD
            </span>
            <div className="w-5 h-8 rounded-full border-2 border-[#48d597]/50 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-2 bg-[#48d597] rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CIVIC SENSE SECTION */}
      <section
        id="why-it-matters"
        className="relative py-28"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,20,15,0), rgba(7,20,15,0.12) 15%, rgba(7,20,15,0.12) 85%, rgba(7,20,15,0))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>Core Civic Foundations</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Civic sense starts with us.
            </h2>
            <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed font-normal drop-shadow">
              Everyday actions influence the cleanliness, safety, accessibility, and quality of shared spaces. When each person honors public commons, our entire society thrives.
            </p>
          </div>

          {/* 4 Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div
              className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl flex flex-col justify-between hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-300">
                  <Recycle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Keep It Clean
                </h3>
                <p className="text-sm text-slate-200/90 leading-relaxed">
                  Dispose of waste properly and protect public spaces. Eliminate street littering, sort trash responsibly, and safeguard parks.
                </p>
              </div>
              <div className="pt-6 border-t border-emerald-900/30 mt-6 flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
                <span>Clean spaces elevate health</span>
                <Sparkle className="w-3 h-3" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl flex flex-col justify-between hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-300">
                  <Building className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Respect Public Spaces
                </h3>
                <p className="text-sm text-slate-200/90 leading-relaxed">
                  Treat roads, parks, transport, buildings, and shared facilities responsibly. They belong to all citizens equally.
                </p>
              </div>
              <div className="pt-6 border-t border-emerald-900/30 mt-6 flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
                <span>Preserve public monuments</span>
                <Sparkle className="w-3 h-3" />
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl flex flex-col justify-between hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Follow the Rules
                </h3>
                <p className="text-sm text-slate-200/90 leading-relaxed">
                  Respect traffic rules, queues, public guidelines, and community regulations to guarantee harmony and orderly daily mobility.
                </p>
              </div>
              <div className="pt-6 border-t border-emerald-900/30 mt-6 flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
                <span>Safe streets save lives</span>
                <Sparkle className="w-3 h-3" />
              </div>
            </div>

            {/* Card 4 */}
            <div
              className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl flex flex-col justify-between hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-all duration-300">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Care for Others
                </h3>
                <p className="text-sm text-slate-200/90 leading-relaxed">
                  Consider pedestrians, elderly people, children, people with disabilities, and the wider community in every public interaction.
                </p>
              </div>
              <div className="pt-6 border-t border-emerald-900/30 mt-6 flex items-center text-xs font-semibold text-emerald-400 gap-1.5">
                <span>Inclusivity & compassion</span>
                <Sparkle className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CIVIC SENSE CHALLENGES SECTION */}
      <section
        id="challenges"
        className="relative py-28"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,20,15,0), rgba(7,20,15,0.12) 15%, rgba(7,20,15,0.12) 85%, rgba(7,20,15,0))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Civic Habit Tracker</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                Everyday actions. Real impact.
              </h2>
              <p className="text-base text-slate-200/90 max-w-xl font-normal drop-shadow">
                Small consistent civic habits transform shared neighborhoods. Check off the challenges you practiced today.
              </p>
            </div>

            {/* Completion Counter Badge */}
            <div
              className="rounded-2xl p-4 sm:px-6 flex items-center gap-4 shadow-lg"
              style={{
                background: 'rgba(8, 30, 20, 0.45)',
                border: '1px solid rgba(110, 220, 170, 0.22)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                {completedCount}/8
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                  Challenges Completed
                </p>
                <p className="text-sm text-slate-200">
                  {completedCount === 8
                    ? '🎉 Incredible! All 8 completed today!'
                    : completedCount > 0
                    ? `${completedCount} habits checked off today`
                    : 'Select a challenge to begin'}
                </p>
              </div>
            </div>
          </div>

          {/* Challenge Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultChallenges.map((challenge) => {
              const Icon = challenge.icon;
              const isDone = !!completedChallenges[challenge.id];

              return (
                <div
                  key={challenge.id}
                  className="relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:border-emerald-400/50"
                  style={{
                    background: isDone ? 'rgba(16, 48, 30, 0.55)' : 'rgba(8, 30, 20, 0.38)',
                    border: isDone ? '1px solid rgba(74, 222, 128, 0.5)' : '1px solid rgba(110, 220, 170, 0.18)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: isDone ? '0 10px 30px rgba(5, 40, 20, 0.4)' : 'none',
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-400 text-emerald-950'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                        {challenge.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-1.5">
                        {challenge.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {challenge.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/5">
                    <button
                      onClick={() => toggleChallenge(challenge.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                        isDone
                          ? 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>✓ Challenge completed</span>
                        </>
                      ) : (
                        <span>Mark as Done</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. IMPACT SECTION WITH ANIMATED COUNTERS */}
      <section
        id="take-action"
        className="relative py-28"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,20,15,0), rgba(7,20,15,0.12) 15%, rgba(7,20,15,0.12) 85%, rgba(7,20,15,0))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <SunMedium className="w-3.5 h-3.5" />
              <span>Collective Progress</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Tangible Civic Impact
            </h2>
            <p className="text-sm sm:text-base text-slate-200/90 font-normal drop-shadow">
              When millions of people commit to everyday discipline, communities transform rapidly.
            </p>
          </div>

          {/* 4 Impact Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="rounded-3xl p-8 text-center sm:text-left space-y-2 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                Individual Deeds
              </div>
              <div className="text-4xl sm:text-5xl text-white font-black tracking-tight">
                <Counter end={10000} suffix="+" />
              </div>
              <p className="text-xs text-slate-300">
                Civic actions logged by active neighborhood participants.
              </p>
            </div>

            <div
              className="rounded-3xl p-8 text-center sm:text-left space-y-2 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider">
                Community Power
              </div>
              <div className="text-4xl sm:text-5xl text-white font-black tracking-tight">
                <Counter end={2500} suffix="+" />
              </div>
              <p className="text-xs text-slate-300">
                Active citizens taking daily ownership of public areas.
              </p>
            </div>

            <div
              className="rounded-3xl p-8 text-center sm:text-left space-y-2 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                Revitalized Commons
              </div>
              <div className="text-4xl sm:text-5xl text-white font-black tracking-tight">
                <Counter end={850} suffix="+" />
              </div>
              <p className="text-xs text-slate-300">
                Clean spaces protected, maintained, and litter-free.
              </p>
            </div>

            <div
              className="rounded-3xl p-8 text-center sm:text-left space-y-2 shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                Local Engagement
              </div>
              <div className="text-4xl sm:text-5xl text-white font-black tracking-tight">
                <Counter end={120} suffix="+" />
              </div>
              <p className="text-xs text-slate-300">
                Community drives organized across smart wards and districts.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8 italic">
            *Illustrative metrics demonstrating collective citizen civic participation.
          </p>
        </div>
      </section>

      {/* 8. COMMUNITY SECTION */}
      <section
        id="community"
        className="relative py-28"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,20,15,0), rgba(7,20,15,0.14) 15%, rgba(7,20,15,0.14) 85%, rgba(7,20,15,0))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Users className="w-3.5 h-3.5" />
              <span>Grassroots Neighborhood Movement</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Change begins in your community.
            </h2>
            <p className="text-base text-slate-200/90 font-normal drop-shadow">
              When residents align with shared respect, cities become cleaner, safer, and naturally vibrant places to live.
            </p>
          </div>

          {/* Three community-focused areas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Area 1 */}
            <div
              className="rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-xl space-y-5 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <TreePine className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Clean surroundings
              </h3>
              <p className="text-sm text-slate-200/90 leading-relaxed">
                Spotless walkways, unpolluted waterways, separated household waste, and green public parks that invite families to gather and recharge in nature.
              </p>
              <ul className="space-y-2 text-xs text-emerald-200/90 pt-2 border-t border-emerald-900/30">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero-litter public transit shelters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Native tree & community garden stewardship</span>
                </li>
              </ul>
            </div>

            {/* Area 2 */}
            <div
              className="rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-xl space-y-5 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Responsible citizens
              </h3>
              <p className="text-sm text-slate-200/90 leading-relaxed">
                Empowered residents who speak up constructively, report municipal hazards, respect queues, and model mindful behavior for the next generation.
              </p>
              <ul className="space-y-2 text-xs text-emerald-200/90 pt-2 border-t border-emerald-900/30">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Proactive reporting of public hazards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Peer-to-peer inspiration & mutual aid</span>
                </li>
              </ul>
            </div>

            {/* Area 3 */}
            <div
              className="rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 shadow-xl space-y-5 hover:border-emerald-400/40"
              style={{
                background: 'rgba(8, 30, 20, 0.38)',
                border: '1px solid rgba(110, 220, 170, 0.18)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Safer streets
              </h3>
              <p className="text-sm text-slate-200/90 leading-relaxed">
                Pedestrian-first crossings, calm traffic speeds, noise-controlled avenues, and well-lit neighborhood avenues where all residents feel secure.
              </p>
              <ul className="space-y-2 text-xs text-emerald-200/90 pt-2 border-t border-emerald-900/30">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zebra-crossing courtesy for elderly & youth</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Quiet horn-free residential zones</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INTERACTIVE CIVIC SCORE SECTION */}
      <section
        id="civic-score"
        className="relative py-28"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,20,15,0), rgba(7,20,15,0.14) 15%, rgba(7,20,15,0.14) 85%, rgba(7,20,15,0))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Compass className="w-3.5 h-3.5" />
              <span>Self Assessment</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              What's your Civic Sense score?
            </h2>
            <p className="text-sm sm:text-base text-slate-200/90 font-normal drop-shadow">
              Answer 5 simple everyday questions. Discover where your civic habits shine and where you can grow.
            </p>
          </div>

          <div
            className="rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
            style={{
              background: 'rgba(8, 30, 20, 0.42)',
              border: '1px solid rgba(110, 220, 170, 0.2)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {/* Questions List */}
            <div className="space-y-6">
              {quizQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl p-5 space-y-3"
                  style={{
                    background: 'rgba(5, 18, 12, 0.4)',
                    border: '1px solid rgba(110, 220, 170, 0.12)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        0{idx + 1}.
                      </span>
                      <h4 className="text-base font-bold text-white">{q.question}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{q.subtitle}</p>
                    </div>
                  </div>

                  {/* Radio Choice Buttons */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
                    {['Always', 'Sometimes', 'Rarely'].map((option) => {
                      const isSelected = answers[q.id] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleAnswerChange(q.id, option)}
                          className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20 font-bold scale-[1.02]'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Score Result Card */}
            <div
              className="rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(14, 40, 26, 0.55), rgba(8, 24, 16, 0.65))',
                border: '1px solid rgba(110, 220, 170, 0.35)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border tracking-wider uppercase ${scoreFeedback.color}`}>
                {scoreFeedback.badge}
              </div>

              <div className="flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Your Civic Sense Score
                </span>
                <div className="text-6xl sm:text-7xl font-black text-white flex items-baseline justify-center gap-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 tabular-nums">
                    {currentScore}
                  </span>
                  <span className="text-2xl text-slate-400 font-normal">/ 100</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden max-w-md mx-auto">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${currentScore}%` }}
                />
              </div>

              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                {scoreFeedback.text}
              </p>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setAnswers({
                      q1: 'Always',
                      q2: 'Always',
                      q3: 'Always',
                      q4: 'Always',
                      q5: 'Always',
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Aim for 100/100</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION SECTION */}
      <section
        className="relative py-28 overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,20,15,0), rgba(7,20,15,0.16) 20%, rgba(7,20,15,0.2) 80%, rgba(7,20,15,0.06))',
        }}
      >
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Join Conscious Citizens Everywhere</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
            Be the reason your community gets better.
          </h2>

          <p className="text-base sm:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Civic sense isn't one big action. It's thousands of small choices made every day.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/get-started"
              id="cta-start-journey-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm text-emerald-950 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 hover:from-emerald-200 hover:to-teal-200 shadow-xl shadow-emerald-950/80 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Start Your Civic Journey</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </Link>

            <a
              href="#why-it-matters"
              onClick={(e) => scrollToSection(e, 'why-it-matters')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Learn More</span>
            </a>

            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-xs text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all"
              >
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <span>Report Public Issue</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <CivicFooter />
    </div>
  );
}
