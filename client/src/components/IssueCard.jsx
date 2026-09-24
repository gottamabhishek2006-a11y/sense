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
  Trash2
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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            <Icon className="w-3.5 h-3.5 text-emerald-600" />
            {issue.category}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
            {issue.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5">
          {issue.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{issue.location}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {issue.description}
        </p>
      </div>

      {/* Footer: Metadata & Upvote */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{issue.timeAgo || 'Recently'}</span>
        </div>

        <button
          onClick={handleVote}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
            hasVoted
              ? 'bg-emerald-100 text-emerald-800 font-semibold'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
          title="Upvote issue priority"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
          <span>{upvotes}</span>
        </button>
      </div>
    </div>
  );
};

export default IssueCard;
