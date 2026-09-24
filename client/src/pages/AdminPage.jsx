import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Users,
  RefreshCw,
  Filter
} from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const [serverCheckMessage, setServerCheckMessage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Administrative moderation queue state
  const [complaints, setComplaints] = useState([
    {
      id: 'CFX-1042',
      ward: 'Ward 8',
      category: 'Roads',
      title: 'Deep crater pothole near pedestrian crossing',
      department: 'Public Works (Road Division)',
      priority: 'High',
      status: 'In Progress',
      reportedAt: '2026-09-23 10:14 AM',
    },
    {
      id: 'CFX-1039',
      ward: 'Ward 12',
      category: 'Lighting',
      title: 'Three streetlights non-operational along walking trail',
      department: 'Electrical & Grid Maintenance',
      priority: 'Medium',
      status: 'Resolved',
      reportedAt: '2026-09-23 09:30 AM',
    },
    {
      id: 'CFX-1035',
      ward: 'Ward 4',
      category: 'Water',
      title: 'Underground drinking water pipeline burst',
      department: 'Municipal Water Board',
      priority: 'Critical',
      status: 'Under Review',
      reportedAt: '2026-09-23 08:45 AM',
    },
    {
      id: 'CFX-1028',
      ward: 'Ward 11',
      category: 'Sanitation',
      title: 'Overflowing commercial waste bin near market',
      department: 'Sanitation & Solid Waste',
      priority: 'Medium',
      status: 'Resolved',
      reportedAt: '2026-09-22 04:15 PM',
    },
  ]);

  const verifyServerAdminRole = async () => {
    setIsVerifying(true);
    try {
      const data = await authAPI.checkAdmin();
      setServerCheckMessage({
        success: true,
        text: `${data.message} (Verified user ID: ${data.user._id})`,
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
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: Municipal Administrator
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Municipal Administrative Console
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Logged in as <strong>{user?.name}</strong> ({user?.email}). Authorized to triage complaints, dispatch municipal work crews, and resolve city tickets.
          </p>
        </div>

        <div>
          <button
            onClick={verifyServerAdminRole}
            disabled={isVerifying}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/25"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-verify Admin JWT</span>
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
          <p className="text-xs text-slate-500">Across 4 active wards</p>
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
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">8</p>
          <p className="text-xs text-slate-500">Inspection verified</p>
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
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Municipal Triage & Work Order Dispatch
            </h3>
            <p className="text-xs text-slate-500">
              Change complaint status to dispatch crews or mark as resolved
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 tracking-wider">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Ward</th>
                <th className="py-3.5 px-4">Issue Title</th>
                <th className="py-3.5 px-4">Assigned Department</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                    {item.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {item.ward}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        item.priority === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
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
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'In Progress')}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'Resolved')}
                      className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                    >
                      Mark Fixed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
