import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  X,
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle,
  Loader2,
  Navigation
} from 'lucide-react';

const ReportModal = ({ isOpen, onClose, onIssueCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState('Roads');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    setLocation('Ward 14 - Maple Avenue & 4th Street');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !location || !description) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const ticketId = `CFX-${Math.floor(1000 + Math.random() * 9000)}`;
      const newIssue = {
        id: ticketId,
        category,
        title,
        location,
        description,
        priority,
        status: 'Under Review',
        timeAgo: 'Just now',
        upvotes: 1,
        reportedBy: user?.name || 'Anonymous Citizen',
      };

      if (onIssueCreated) {
        onIssueCreated(newIssue);
      }

      setIsSubmitting(false);
      setSubmittedTicket(ticketId);
    }, 600);
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setTitle('');
    setLocation('');
    setDescription('');
    setCategory('Roads');
    setPriority('Medium');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTicket ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Civic Report Dispatched!
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your report has been logged and assigned ticket ID{' '}
              <strong className="text-emerald-700 font-mono text-base">{submittedTicket}</strong>.
              Municipal inspectors in your ward have been alerted.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-emerald-600/20"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Report a Civic Issue
                </h3>
                <p className="text-xs text-slate-500">
                  Direct dispatch to Municipal Public Works & Sanitation
                </p>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>Tip: Sign in to track live status updates in your citizen dashboard.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['Roads', 'Lighting', 'Water', 'Sanitation'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                        category === cat
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deep pothole near intersection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location / Landmark
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" /> Auto-fill Ward
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Street name, landmark, or ward number"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide context on hazards, duration of issue, or nearby safety risks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-600/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Civic Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
