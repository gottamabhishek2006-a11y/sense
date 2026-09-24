import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReportModal from '../components/ReportModal';

const MainLayout = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [recentIssues, setRecentIssues] = useState([
    {
      id: 'CFX-1042',
      category: 'Roads',
      title: 'Deep crater pothole near pedestrian crossing',
      location: 'Ward 8 - 5th Cross & Elm St.',
      description: 'Pothole is causing two-wheelers to skid during morning traffic. Needs asphalt filling urgently.',
      status: 'In Progress',
      timeAgo: '45 mins ago',
      upvotes: 28,
    },
    {
      id: 'CFX-1039',
      category: 'Lighting',
      title: 'Three streetlights non-operational along walking trail',
      location: 'Ward 12 - Riverside Greenway Park',
      description: 'The entire walking track is dark after 7 PM, creating safety concerns for evening commuters.',
      status: 'Resolved',
      timeAgo: '2 hours ago',
      upvotes: 42,
    },
    {
      id: 'CFX-1035',
      category: 'Water',
      title: 'Underground drinking water pipeline burst',
      location: 'Ward 4 - Market Circle Road',
      description: 'Continuous fresh water runoff on the street for the past 6 hours. High pressure loss.',
      status: 'Under Review',
      timeAgo: '3 hours ago',
      upvotes: 19,
    },
    {
      id: 'CFX-1028',
      category: 'Sanitation',
      title: 'Overflowing commercial waste bin near market',
      location: 'Ward 11 - Central Bazaar North Gate',
      description: 'Commercial vegetable waste accumulating outside bins and obstructing walkway.',
      status: 'Resolved',
      timeAgo: '1 day ago',
      upvotes: 35,
    },
  ]);

  const handleIssueCreated = (newIssue) => {
    setRecentIssues((prev) => [newIssue, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenReportModal={() => setIsReportModalOpen(true)} />
      <main className="flex-grow">
        <Outlet
          context={{
            onOpenReportModal: () => setIsReportModalOpen(true),
            recentIssues,
            onIssueCreated: handleIssueCreated,
          }}
        />
      </main>
      <Footer />

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
