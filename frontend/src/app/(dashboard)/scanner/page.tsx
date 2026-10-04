'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, Sparkles, AlertCircle, RefreshCw, Layers, CheckCircle2, ChevronRight, VideoOff } from 'lucide-react';
import { analyzeFoodImage, analyzeWebcamFrame } from '../../../services/backendClient';
import { saveLatestAnalysis } from '../../../services/storage';

type ActiveTab = 'upload' | 'webcam';
type ScanStatus = 'idle' | 'processing' | 'error';

export default function ScannerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Initializing scan...');
  const [progressStage, setProgressStage] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Webcam State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  // Initialize/Stop Webcam based on active tab
  useEffect(() => {
    if (activeTab === 'webcam') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [activeTab]);

  const startWebcam = async () => {
    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
      }
    } catch (err: any) {
      setWebcamError(err.message || 'Unable to access camera. Please allow webcam permissions in your browser.');
      setWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please select a smaller food image under 10MB.');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerProgressStages = () => {
    setProgressStage(1);
    setStatusMessage('1/5 Applying OpenCV Image Processing (Denoising, CLAHE, HSV)...');
    
    setTimeout(() => {
      setProgressStage(2);
      setStatusMessage('2/5 Running Custom YOLO11 Object Detection from scratch...');
    }, 600);

    setTimeout(() => {
      setProgressStage(3);
      setStatusMessage('3/5 Evaluating Custom Freshness CNN & Spoilage Masks...');
    }, 1200);

    setTimeout(() => {
      setProgressStage(4);
      setStatusMessage('4/5 Calibrating Physical Dimensions & Weight Regression...');
    }, 1800);

    setTimeout(() => {
      setProgressStage(5);
      setStatusMessage('5/5 Scaling USDA Nutritional Profiles & Finalizing Report...');
    }, 2400);
  };

  const handleAnalyzeUpload = async () => {
    if (!selectedFile) return;
    setStatus('processing');
    setErrorMessage(null);
    triggerProgressStages();

    try {
      const response = await analyzeFoodImage(selectedFile);
      await saveLatestAnalysis(response);
      router.push('/results');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Analysis failed. Please check backend connection.');
    }
  };

  const handleCaptureWebcam = async () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);

    setStatus('processing');
    setErrorMessage(null);
    triggerProgressStages();

    try {
      const response = await analyzeWebcamFrame(base64Image);
      await saveLatestAnalysis(response);
      router.push('/results');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Webcam analysis failed. Please check backend.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Academic AI Vision System
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Food Quality & Nutrition Scanner</h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Upload a food image or capture a live webcam frame to run OpenCV processing and custom scratch-trained AI models.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 border border-slate-200">
          <button
            onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            Upload Image
          </button>
          <button
            onClick={() => { setActiveTab('webcam'); setErrorMessage(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'webcam'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            Live Camera Scan
          </button>
        </div>
      </div>

      {/* Processing State Animation */}
      {status === 'processing' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-md text-center space-y-6 max-w-lg mx-auto">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
            <Layers className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800">Processing Academic Pipeline</h3>
            <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              {statusMessage}
            </p>
          </div>

          {/* Pipeline Visual Breadcrumb */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${(progressStage / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Tab Panel */}
      {status !== 'processing' && activeTab === 'upload' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Click or drag & drop food image here</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Supports JPG, PNG, WebP up to 10MB (Apple, Banana, Orange, Tomato, Potato, etc.)
              </p>
              <button
                type="button"
                className="mt-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Select From Device
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[360px] border border-slate-800">
                <img src={previewUrl} alt="Preview" className="max-h-[340px] w-auto object-contain" />
                <button
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm"
                >
                  Change Image
                </button>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Reset
                </button>
                <button
                  onClick={handleAnalyzeUpload}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Image
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Webcam Tab Panel */}
      {status !== 'processing' && activeTab === 'webcam' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {webcamError ? (
            <div className="p-8 text-center space-y-3 bg-rose-50 border border-rose-200 rounded-2xl">
              <VideoOff className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-rose-900">Webcam Not Available</h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto">{webcamError}</p>
              <button
                onClick={startWebcam}
                className="mt-2 bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[420px] border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[400px]"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Live Camera Feed</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleCaptureWebcam}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02]"
                >
                  <Camera className="w-5 h-5" />
                  Scan Now (Capture Frame)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Notice */}
      {status === 'error' && errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            onClick={() => setStatus('idle')}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg font-bold text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
