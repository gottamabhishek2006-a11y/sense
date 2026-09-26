import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  Construction,
  Lightbulb,
  Droplets,
  Trash2,
  Camera,
  Maximize2,
  X
} from 'lucide-react';

const categoryIcons = {
  Roads: Construction,
  Lighting: Lightbulb,
  Water: Droplets,
  Sanitation: Trash2,
  General: AlertCircle,
};

const statusConfig = {
  Resolved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
  },
  'In Progress': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Construction,
    dot: 'bg-blue-500 animate-pulse',
  },
  'Under Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
    dot: 'bg-amber-500',
  },
};

const IssueCard = ({ issue }) => {
  const [upvotes, setUpvotes] = useState(issue.upvotes || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const Icon = categoryIcons[issue.category] || AlertCircle;
  const status = statusConfig[issue.status] || statusConfig['Under Review'];
  const StatusIcon = status.icon;

  const handleVote = () => {
    if (hasVoted) {
      setUpvotes((v) => v - 1);
      setHasVoted(false);
    } else {
      setUpvotes((v) => v + 1);
      setHasVoted(true);
    }
  };

  return (
    <>
      <div
        className="rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1"
        style={{
          background: 'rgba(235, 245, 238, 0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(180, 206, 188, 0.45)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div>
          {/* Header: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-900/10 text-emerald-900 border border-emerald-800/15">
              <Icon className="w-3.5 h-3.5 text-emerald-700" />
              {issue.category}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {issue.status}
            </span>
          </div>

          {/* Problem Photo Banner if attached */}
          {issue.imageUrl && (
            <div
              onClick={() => setIsPhotoZoomed(true)}
              className="relative mb-3.5 rounded-xl overflow-hidden cursor-pointer group/img border border-emerald-900/15 bg-slate-900/10 aspect-video max-h-40"
              title="Click to zoom problem photo"
            >
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>Evidence</span>
              </div>
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/70 text-xs font-semibold flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" /> View Photo
                </span>
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-1.5">
            {issue.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{issue.location}</span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-2 mb-4">
            {issue.description}
          </p>
        </div>

        {/* Footer: Metadata & Upvote */}
        <div className="pt-3 border-t border-emerald-900/10 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{issue.timeAgo || 'Recently'}</span>
          </div>

          <button
            onClick={handleVote}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              hasVoted
                ? 'bg-emerald-700 text-white font-semibold shadow-sm'
                : 'hover:bg-emerald-900/10 text-slate-700'
            }`}
            title="Upvote issue priority"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white text-white' : ''}`} />
            <span>{upvotes}</span>
          </button>
        </div>
      </div>

      {/* Citizen Photo Zoom Modal */}
      {isPhotoZoomed && issue.imageUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Camera className="w-3 h-3" /> Problem Evidence Photo
              </span>
              <span className="text-xs font-mono text-slate-400">{issue.id}</span>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 mb-3 max-h-[380px] flex items-center justify-center">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-auto max-h-[380px] object-contain"
              />
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-1">{issue.title}</h4>
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{issue.location}</span>
            </p>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              "{issue.description}"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default IssueCard;
