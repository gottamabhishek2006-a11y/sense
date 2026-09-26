import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

/**
 * CameraCapture — Browser camera modal component.
 *
 * Uses navigator.mediaDevices.getUserMedia() for live camera preview.
 * Captures frame using canvas.drawImage() → canvas.toBlob() → base64 data URL.
 * Properly stops all camera tracks on close/unmount.
 *
 * Props:
 *   isOpen      {boolean}  - Whether camera modal is shown
 *   onCapture   {function} - Called with captured image data URL and filename
 *   onClose     {function} - Called when modal is dismissed
 */
const CameraCapture = ({ isOpen, onCapture, onClose }) => {
  const [phase, setPhase] = useState('idle'); // idle | requesting | streaming | captured | error
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop all camera tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount or when closed
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('idle');
      setErrorMessage('');
      setCapturedDataUrl(null);
    } else {
      stopStream();
    }
  }, [isOpen, stopStream]);

  // Start camera
  const startCamera = useCallback(async () => {
    setPhase('requesting');
    setErrorMessage('');
    setCapturedDataUrl(null);

    try {
      // Request camera — prefer rear-facing on mobile (environment), fallback to any
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setPhase('streaming');
    } catch (err) {
      stopStream();

      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message =
          'Camera access was denied. Please allow camera permissions in your browser settings, then try again. Alternatively, upload an image using the file picker.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message =
          'No camera device found. Please connect a camera or use the file upload option instead.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message =
          'Camera is already in use by another application. Please close other apps using the camera and try again.';
      } else if (err.name === 'OverconstrainedError') {
        // Retry with relaxed constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setPhase('streaming');
          return;
        } catch {
          message = 'Camera configuration not supported by this device.';
        }
      } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        message =
          'Your browser does not support camera capture. Please use Chrome, Firefox, Edge, or Safari and ensure the page is served over HTTPS.';
      }

      setErrorMessage(message);
      setPhase('error');
    }
  }, [stopStream]);

  // Capture photo from video feed
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    // Resize to max 1280px to keep file size manageable
    const MAX_DIM = 1280;
    let drawWidth = width;
    let drawHeight = height;
    if (width > MAX_DIM || height > MAX_DIM) {
      if (width > height) {
        drawHeight = Math.round((height * MAX_DIM) / width);
        drawWidth = MAX_DIM;
      } else {
        drawWidth = Math.round((width * MAX_DIM) / height);
        drawHeight = MAX_DIM;
      }
    }

    canvas.width = drawWidth;
    canvas.height = drawHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, drawWidth, drawHeight);

    // Capture as JPEG data URL (0.82 quality)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedDataUrl(dataUrl);

    // Stop camera stream to release camera indicator
    stopStream();
    setPhase('captured');
  }, [stopStream]);

  // Retake — restart camera
  const handleRetake = useCallback(() => {
    setCapturedDataUrl(null);
    setPhase('idle');
    // Short delay to ensure stream was fully stopped
    setTimeout(() => startCamera(), 100);
  }, [startCamera]);

  // Use captured photo
  const handleUsePhoto = useCallback(() => {
    if (capturedDataUrl) {
      const filename = `civic_photo_${Date.now()}.jpg`;
      onCapture(capturedDataUrl, filename);
      onClose();
    }
  }, [capturedDataUrl, onCapture, onClose]);

  // Close and clean up
  const handleClose = useCallback(() => {
    stopStream();
    setPhase('idle');
    setCapturedDataUrl(null);
    setErrorMessage('');
    onClose();
  }, [stopStream, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capture Photo</h3>
              <p className="text-[11px] text-slate-500">
                {phase === 'captured' ? 'Preview captured photo' : 'Take a photo of the civic issue'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Idle — start camera prompt */}
          {phase === 'idle' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">Ready to capture</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click below to open your camera and take a photo of the civic issue.
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-emerald-600/25"
              >
                <Camera className="w-4 h-4" />
                Open Camera
              </button>
            </div>
          )}

          {/* Requesting permission */}
          {phase === 'requesting' && (
            <div className="text-center py-10 space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Requesting camera access...</p>
              <p className="text-xs text-slate-500">
                Please allow camera permission when your browser prompts.
              </p>
            </div>
          )}

          {/* Live camera stream */}
          {phase === 'streaming' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-72 object-cover"
                />
                {/* Live indicator */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={takePhoto}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
            </div>
          )}

          {/* Captured photo preview */}
          {phase === 'captured' && capturedDataUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                <img
                  src={capturedDataUrl}
                  alt="Captured civic issue photo"
                  className="w-full max-h-72 object-contain"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3" />
                  Captured
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Review the photo. Retake if it's blurry or doesn't show the issue clearly.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleUsePhoto}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25"
                >
                  <CheckCircle className="w-4 h-4" />
                  Use Photo
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {phase === 'error' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;
