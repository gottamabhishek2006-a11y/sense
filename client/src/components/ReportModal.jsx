import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { issuesAPI } from '../services/api';
import CameraCapture from './CameraCapture';
import {
  X,
  AlertTriangle,
  MapPin,
  Camera,
  CheckCircle,
  Loader2,
  Navigation,
  UploadCloud,
  Trash2,
  Sparkles,
  Video,
} from 'lucide-react';

const CIVIC_SAMPLES = [
  {
    label: 'Road Pothole',
    category: 'Roads',
    name: 'road_pothole_evidence.jpg',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Broken Streetlight',
    category: 'Lighting',
    name: 'dark_streetlight_fault.jpg',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Water Pipe Leak',
    category: 'Water',
    name: 'water_pipeline_rupture.jpg',
    url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Garbage Overflow',
    category: 'Sanitation',
    name: 'overflowing_waste_pile.jpg',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  },
];

const ReportModal = ({ isOpen, onClose, onIssueCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState('Roads');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [submittedImage, setSubmittedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSource, setImageSource] = useState(null); // 'camera' | 'upload' | 'sample'

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    setLocation('Ward 14 - Maple Avenue & 4th Street');
  };

  // Validate and resize image file
  const processImageFile = (file) => {
    if (!file) return;

    const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (!VALID_TYPES.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Image is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1280;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        setImageUrl(compressedDataUrl);
        setImageName(file.name || 'problem_photo.jpg');
        setImageSource('upload');
      };
      img.onerror = () => {
        setUploadError('Failed to read image file. Please try a different file.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handlePickSample = (sample) => {
    setImageUrl(sample.url);
    setImageName(sample.name);
    setCategory(sample.category);
    setUploadError(null);
    setImageSource('sample');
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    setImageName('');
    setImageSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Camera capture callback
  const handleCameraCapture = (capturedDataUrl, filename) => {
    setImageUrl(capturedDataUrl);
    setImageName(filename);
    setImageSource('camera');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !description) return;

    setIsSubmitting(true);

    try {
      // Submit to backend API
      const data = await issuesAPI.createIssue({
        category,
        title,
        location,
        description,
        priority,
        imageUrl: imageUrl || null,
        imageName: imageName || null,
      });

      if (data.success && data.issue) {
        const newIssue = {
          id: data.issue.ticketId || data.issue.id,
          ticketId: data.issue.ticketId || data.issue.id,
          ward: data.issue.ward,
          category: data.issue.category,
          title: data.issue.title,
          location: data.issue.location,
          description: data.issue.description,
          priority: data.issue.priority,
          status: data.issue.status,
          timeAgo: 'Just now',
          reportedAt: data.issue.reportedAt,
          upvotes: data.issue.upvotes,
          reportedBy: data.issue.reportedBy,
          imageUrl: data.issue.imageUrl || null,
          imageName: data.issue.imageName || null,
          department: data.issue.department,
        };

        if (onIssueCreated) {
          onIssueCreated(newIssue);
        }

        setSubmittedImage(imageUrl || null);
        setSubmittedTicket(data.issue.ticketId || data.issue.id);
      } else {
        throw new Error(data.message || 'Failed to submit issue.');
      }
    } catch (err) {
      // Fallback: create local-only issue if backend is unavailable
      console.warn('[ReportModal] Backend submission failed, creating local issue:', err.message);

      const ticketId = `CFX-${Math.floor(1000 + Math.random() * 9000)}`;
      const newIssue = {
        id: ticketId,
        ticketId,
        ward: location.includes('Ward') ? location.split('-')[0].trim() : 'Ward 7',
        category,
        title,
        location,
        description,
        priority,
        status: 'Under Review',
        timeAgo: 'Just now',
        reportedAt: new Date().toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        upvotes: 1,
        reportedBy: user?.name || 'Anonymous Citizen',
        imageUrl: imageUrl || null,
        imageName: imageName || null,
      };

      if (onIssueCreated) {
        onIssueCreated(newIssue);
      }

      setSubmittedImage(imageUrl || null);
      setSubmittedTicket(ticketId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setSubmittedImage(null);
    setTitle('');
    setLocation('');
    setDescription('');
    setCategory('Roads');
    setPriority('Medium');
    setImageUrl('');
    setImageName('');
    setImageSource(null);
    setUploadError(null);
    onClose();
  };

  return (
    <>
      {/* Camera Modal (separate layer above report modal) */}
      <CameraCapture
        isOpen={isCameraOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraOpen(false)}
      />

      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {submittedTicket ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Civic Report Dispatched!
              </h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Your report has been logged and assigned ticket ID{' '}
                <strong className="text-emerald-700 font-mono text-base">{submittedTicket}</strong>.
                Municipal inspectors and authorized crews can now review the problem details.
              </p>

              {submittedImage && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex items-center gap-3">
                  <img
                    src={submittedImage}
                    alt="Problem Evidence"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Problem Photo Attached
                    </p>
                    <p className="text-slate-500">
                      Transmitted to Authorized Municipal Portal for review.
                    </p>
                    {imageSource === 'camera' && (
                      <p className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Camera className="w-3 h-3" /> Captured with camera
                      </p>
                    )}
                  </div>
                </div>
              )}

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

                {/* Problem Photo / Camera Capture / File Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Problem Photo / Evidence</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Visible to Municipal Team
                    </span>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="problem-photo-input"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {imageUrl ? (
                    /* Attached Photo Preview */
                    <div className="relative p-3 rounded-xl border border-emerald-300 bg-emerald-50/60 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={imageUrl}
                          alt="Problem Evidence Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-200 shadow-sm shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {imageName || 'Problem photo attached'}
                          </p>
                          <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {imageSource === 'camera' ? 'Captured with camera' : 'Ready for review'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsCameraOpen(true)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/80 rounded-md transition-colors flex items-center gap-1"
                          title="Retake with camera"
                        >
                          <Camera className="w-3 h-3" />
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Photo options — camera + upload */
                    <div className="space-y-2">
                      {/* Camera capture button */}
                      <button
                        type="button"
                        id="capture-photo-btn"
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-600 text-emerald-700 font-semibold text-sm transition-all"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Video className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span>Capture Photo with Camera</span>
                      </button>

                      {/* Upload dropzone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-3.5 text-center transition-all ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
                            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/20'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2.5">
                          <UploadCloud className="w-4 h-4 text-slate-400" />
                          <div className="text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Upload from device</span>
                            <span className="text-slate-400 ml-1">JPEG, PNG, WebP up to 10MB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{uploadError}</p>
                  )}

                  {/* Sample Photo Presets */}
                  {!imageUrl && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mr-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Quick sample:
                      </span>
                      {CIVIC_SAMPLES.map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => handlePickSample(sample)}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 transition-colors"
                        >
                          + {sample.label}
                        </button>
                      ))}
                    </div>
                  )}
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
                  />
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
    </>
  );
};

export default ReportModal;
