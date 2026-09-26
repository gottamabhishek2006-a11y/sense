import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI, issuesAPI } from '../services/api';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Users,
  RefreshCw,
  Filter,
  Camera,
  Eye,
  X,
  MapPin,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const outletCtx = useOutletContext();
  const [serverCheckMessage, setServerCheckMessage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // Backend-fetched issues
  const [backendIssues, setBackendIssues] = useState([]);
  const [isFetchingIssues, setIsFetchingIssues] = useState(true);

  // Fallback complaints from MainLayout context (local state)
  const outletComplaints = outletCtx?.recentIssues || [];

  // Fetch issues from backend (admin-only endpoint)
  const fetchIssues = async () => {
    setIsFetchingIssues(true);
    try {
      const data = await issuesAPI.getAllIssues();
      if (data.success && Array.isArray(data.issues)) {
        setBackendIssues(data.issues);
      }
    } catch (err) {
      // Fall back to outlet context issues if backend fetch fails
      console.warn('[AdminPage] Backend issue fetch failed, using local data:', err.message);
    } finally {
      setIsFetchingIssues(false);
    }
  };

  // Prefer backend issues; fall back to outlet context
  const complaints = backendIssues.length > 0 ? backendIssues : outletComplaints;

  const verifyServerAdminRole = async () => {
    setIsVerifying(true);
    try {
      const data = await authAPI.checkAdmin();
      setServerCheckMessage({
        success: true,
        text: `${data.message} (Verified user ID: ${data.user.id})`,
      });
    } catch (err) {
      setServerCheckMessage({
        success: false,
        text: err.response?.data?.message || err.message || 'Authorization failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyServerAdminRole();
    fetchIssues();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    // Try backend update first
    try {
      await issuesAPI.updateIssueStatus(id, newStatus);
      // Update local state
      setBackendIssues((prev) =>
        prev.map((c) => (c.id === id || c.ticketId === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.warn('[AdminPage] Backend status update failed:', err.message);
      // Fall back to outlet context update
      if (outletCtx?.onUpdateIssueStatus) {
        outletCtx.onUpdateIssueStatus(id, newStatus);
      }
    }

    if (activePhotoModal && (activePhotoModal.id === id || activePhotoModal.ticketId === id)) {
      setActivePhotoModal((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const filteredComplaints = complaints.filter((item) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'With Photos') return !!item.imageUrl;
    return item.status === statusFilter;
  });

  const photoCount = complaints.filter((c) => !!c.imageUrl).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: Authorized Municipal Official
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Municipal Administrative Console
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Logged in as <strong>{user?.name}</strong> ({user?.email}). Authorized to triage complaints, inspect citizen problem evidence photos, dispatch crews, and resolve tickets.
          </p>
        </div>

        <div>
          <button
            onClick={verifyServerAdminRole}
            disabled={isVerifying}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/25"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-verify Authorized JWT</span>
          </button>
        </div>
      </div>

      {/* Server Role Verification Feedback Card */}
      {serverCheckMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between ${
            serverCheckMessage.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 shrink-0" />
            <span>
              <strong>Backend Middleware Check:</strong> {serverCheckMessage.text}
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-white/70">
            HTTP 200 OK
          </span>
        </div>
      )}

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Length</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{complaints.length}</p>
          <p className="text-xs text-slate-500">Across active municipal wards</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Problem Photos</span>
            <Camera className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{photoCount}</p>
          <p className="text-xs text-slate-500">With citizen photo evidence</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned Crews</span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">12</p>
          <p className="text-xs text-slate-500">Public Works & Electrical</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg SLA Completion</span>
            <Clock className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">4.8h</p>
          <p className="text-xs text-slate-500">Under 6h target</p>
        </div>
      </div>

      {/* Moderation Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Municipal Triage & Work Order Dispatch
            </h3>
            <p className="text-xs text-slate-500">
              Inspect citizen problem photos, view detailed reports, and dispatch field crews
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'With Photos', 'Under Review', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'With Photos' && <Camera className="w-3 h-3" />}
                <span>{st}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 tracking-wider">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Problem Photo</th>
                <th className="py-3.5 px-4">Ward</th>
                <th className="py-3.5 px-4">Issue Title & Details</th>
                <th className="py-3.5 px-4">Assigned Department</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Authorized Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No complaints matching current filter.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {item.id}
                    </td>

                    {/* Problem Photo Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.imageUrl ? (
                        <div
                          onClick={() => setActivePhotoModal(item)}
                          className="relative group cursor-pointer inline-block"
                          title="Click to inspect problem photo"
                        >
                          <img
                            src={item.imageUrl}
                            alt="Problem Evidence"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-emerald-500 shadow-sm transition-all"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          No Photo
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {item.ward || 'Ward 8'}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.department || `${item.category} Division`}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          item.priority === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : item.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority || 'Medium'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {item.imageUrl && (
                        <button
                          onClick={() => setActivePhotoModal(item)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Inspect</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'In Progress')}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors"
                      >
                        Dispatch
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold transition-colors"
                      >
                        Mark Fixed
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorized Problem Photo & Details Lightbox Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close photo inspector"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Citizen Problem Evidence
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">
                {activePhotoModal.id}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {activePhotoModal.title}
            </h2>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activePhotoModal.location || activePhotoModal.ward}</span>
            </p>

            {/* High-Resolution Problem Photo */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md mb-5 group relative">
              <img
                src={activePhotoModal.imageUrl}
                alt="Civic Problem Evidence"
                className="w-full max-h-[380px] object-contain mx-auto"
              />
            </div>

            {/* What the Problem Is: Citizen Request & Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  What The Problem Is (Citizen Description)
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  "{activePhotoModal.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Reported By</span>
                  <span className="font-semibold text-slate-700">{activePhotoModal.reportedBy || 'Verified Citizen'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-700">{activePhotoModal.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    activePhotoModal.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activePhotoModal.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activePhotoModal.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Update status directly from inspector:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activePhotoModal.id, 'In Progress')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Dispatch Crew (In Progress)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activePhotoModal.id, 'Resolved')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  Mark Resolved
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
