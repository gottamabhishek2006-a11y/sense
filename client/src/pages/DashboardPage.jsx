import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import IssueCard from '../components/IssueCard';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  ShieldCheck,
  Calendar,
  Mail,
  Award
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { onOpenReportModal, recentIssues } = useOutletContext();
  const [filter, setFilter] = useState('All');

  // Filter complaints
  const filteredIssues =
    filter === 'All'
      ? recentIssues
      : recentIssues.filter((i) => i.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-emerald-100">
              Citizen Portal
            </span>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/40 text-indigo-100 hover:bg-indigo-500/60 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Go to Admin Console
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
            Track your submitted civic issues, monitor municipal repair timelines, and help make your ward cleaner and safer.
          </p>
        </div>

        <div>
          <button
            id="dashboard-report-btn"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-emerald-900 bg-white hover:bg-emerald-50 shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>File New Complaint</span>
          </button>
        </div>
      </div>

      {/* Quick Civic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">My Active Reports</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">2</p>
          <p className="text-xs text-slate-500">1 In Progress, 1 Under Review</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved in Ward</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">14</p>
          <p className="text-xs text-slate-500">Closed by Municipal Works</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Civic Karma Points</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">320</p>
          <p className="text-xs text-slate-500">Top 5% active resident</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Ward Response</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">2.1h</p>
          <p className="text-xs text-slate-500">Ward 8 Dispatch Unit</p>
        </div>
      </div>

      {/* Main Grid: User Profile Summary & Complaints Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details & Session Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Verified Citizen Profile
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-800">{user?.name}</span>
              </div>

              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                  {user?.email}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">Access Role</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {user?.role}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500">MongoDB User ID</span>
                <span className="font-mono text-[10px] text-slate-600 truncate max-w-[160px]">
                  {user?.id || user?._id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Member Since</span>
                <span className="font-medium text-slate-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">JWT Token Status:</p>
                <p className="text-[11px] text-slate-500">
                  Secure Bearer token verified against MongoDB Atlas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ward Issues Tracker & User Complaints */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Ward Complaint Activity
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time status updates from municipal field crews
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'In Progress', 'Resolved', 'Under Review'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filter === st
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
