import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReportModal from '../components/ReportModal';
import { Scene } from '../components/Scene';

const DEFAULT_ISSUES = [
  {
    id: 'CFX-1042',
    ward: 'Ward 8',
    category: 'Roads',
    title: 'Deep crater pothole near pedestrian crossing',
    location: 'Ward 8 - 5th Cross & Elm St.',
    description: 'Pothole is causing two-wheelers to skid during morning traffic. Needs asphalt filling urgently.',
    department: 'Public Works (Road Division)',
    priority: 'High',
    status: 'In Progress',
    timeAgo: '45 mins ago',
    reportedAt: '2026-09-23 10:14 AM',
    upvotes: 28,
    reportedBy: 'Rahul Sharma',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    imageName: 'pothole_crossing.jpg',
  },
  {
    id: 'CFX-1039',
    ward: 'Ward 12',
    category: 'Lighting',
    title: 'Three streetlights non-operational along walking trail',
    location: 'Ward 12 - Riverside Greenway Park',
    description: 'The entire walking track is dark after 7 PM, creating safety concerns for evening commuters.',
    department: 'Electrical & Grid Maintenance',
    priority: 'Medium',
    status: 'Resolved',
    timeAgo: '2 hours ago',
    reportedAt: '2026-09-23 09:30 AM',
    upvotes: 42,
    reportedBy: 'Priya Patel',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    imageName: 'broken_streetlights.jpg',
  },
  {
    id: 'CFX-1035',
    ward: 'Ward 4',
    category: 'Water',
    title: 'Underground drinking water pipeline burst',
    location: 'Ward 4 - Market Circle Road',
    description: 'Continuous fresh water runoff on the street for the past 6 hours. High pressure loss.',
    department: 'Municipal Water Board',
    priority: 'Critical',
    status: 'Under Review',
    timeAgo: '3 hours ago',
    reportedAt: '2026-09-23 08:45 AM',
    upvotes: 19,
    reportedBy: 'Kiran Rao',
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
    imageName: 'pipeline_burst.jpg',
  },
  {
    id: 'CFX-1028',
    ward: 'Ward 11',
    category: 'Sanitation',
    title: 'Overflowing commercial waste bin near market',
    location: 'Ward 11 - Central Bazaar North Gate',
    description: 'Commercial vegetable waste accumulating outside bins and obstructing walkway.',
    department: 'Sanitation & Solid Waste',
    priority: 'Medium',
    status: 'Resolved',
    timeAgo: '1 day ago',
    reportedAt: '2026-09-22 04:15 PM',
    upvotes: 35,
    reportedBy: 'Deepak Varma',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    imageName: 'overflowing_bin.jpg',
  },
];

const MainLayout = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const [recentIssues, setRecentIssues] = useState(() => {
    try {
      const saved = localStorage.getItem('civicsense_issues');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to defaults
    }
    return DEFAULT_ISSUES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('civicsense_issues', JSON.stringify(recentIssues));
    } catch {
      // Ignore quota exceptions
    }
  }, [recentIssues]);

  const handleIssueCreated = (newIssue) => {
    setRecentIssues((prev) => [newIssue, ...prev]);
  };

  const handleUpdateIssueStatus = (id, newStatus) => {
    setRecentIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue))
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100 bg-[#07100b]">
      {/* Background 3D scene persistent throughout the entire website */}
      <div className="civic-world-background fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <Scene />
      </div>

      {/* Subtle atmospheric overlay */}
      <div
        className="atmosphere-overlay fixed inset-0 pointer-events-none z-[1]"
        style={{ background: 'rgba(5, 20, 14, 0.08)' }}
        aria-hidden="true"
      />

      {/* Foreground application layout */}
      <div className="website-content relative z-10 flex flex-col min-h-screen">
        {!isLandingPage && <Navbar onOpenReportModal={() => setIsReportModalOpen(true)} />}
        <main className="flex-grow">
          <Outlet
            context={{
              onOpenReportModal: () => setIsReportModalOpen(true),
              recentIssues,
              onIssueCreated: handleIssueCreated,
              onUpdateIssueStatus: handleUpdateIssueStatus,
            }}
          />
        </main>
        {!isLandingPage && <Footer />}
      </div>

      {/* Global Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onIssueCreated={handleIssueCreated}
      />
    </div>
  );
};

export default MainLayout;
