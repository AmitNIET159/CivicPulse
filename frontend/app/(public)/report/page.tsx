'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, FileText, Camera, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { CATEGORY_CONFIG, Photo } from '@/types';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import GPSLocator from '@/components/map/GPSLocator';
import IssueFormPhotoUpload from '@/components/issues/IssueForm';
import toast from 'react-hot-toast';
import Link from 'next/link';

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function ReportPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <MapPin className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-text-muted mb-6">You need to be logged in to report an issue.</p>
        <Link href="/login" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors inline-block">
          Login to Continue
        </Link>
      </div>
    );
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      setAddress(data.display_name || '');
    } catch {}
  };

  const handleGPS = (lat: number, lng: number, addr: string) => {
    setCoordinates({ lat, lng });
    setAddress(addr);
  };

  const handleSubmit = async () => {
    if (!coordinates) { toast.error('Please select a location'); return; }
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (!category) { toast.error('Please select a category'); return; }
    if (!description.trim()) { toast.error('Please add a description'); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/api/issues', {
        title: title.trim(),
        description: description.trim(),
        category,
        coordinates,
        address,
        photos,
      });
      toast.success('Issue reported successfully! 🎉');
      router.push(`/issues/${res.data.issue._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { num: 2, label: 'Details', icon: <FileText className="w-4 h-4" /> },
    { num: 3, label: 'Photos', icon: <Camera className="w-4 h-4" /> },
    { num: 4, label: 'Review', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
        <p className="text-text-muted mb-8">Help improve your community by reporting civic problems.</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  step === s.num ? 'bg-primary text-white' : step > s.num ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 ${step > s.num ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Location */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold mb-1">Pin the Location</h2>
                <p className="text-sm text-text-muted mb-4">Click on the map or use GPS to set the issue location.</p>
                <div className="flex gap-3 mb-4">
                  <GPSLocator onLocationFound={handleGPS} />
                </div>
                <div className="h-[350px] rounded-xl overflow-hidden border border-border">
                  <IssueMap
                    onMapClick={handleMapClick}
                    selectedPosition={coordinates}
                    height="350px"
                    showClusters={false}
                  />
                </div>
                {coordinates && (
                  <div className="space-y-2">
                    <p className="text-xs text-text-muted font-mono">
                      📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address (auto-filled, editable)"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold">Issue Details</h2>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                      placeholder="Short description of the issue"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                      {title.length}/100
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          category === key ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30 text-text-muted'
                        }`}
                      >
                        <span>{config.icon}</span>
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Description</label>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                      placeholder="Describe the issue in detail..."
                      rows={5}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 resize-none"
                    />
                    <span className="absolute right-3 bottom-3 text-xs text-text-muted">
                      {description.length}/1000
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold">Add Photos</h2>
                <p className="text-sm text-text-muted">Upload photos of the issue (optional but recommended).</p>
                <IssueFormPhotoUpload photos={photos} onPhotosChange={setPhotos} />
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold">Review & Submit</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted text-sm">Title</span>
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted text-sm">Category</span>
                    <span className="text-sm font-medium">{CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.label || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted text-sm">Location</span>
                    <span className="text-sm font-medium truncate max-w-[200px]">{address || 'Map pin set'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-text-muted text-sm">Photos</span>
                    <span className="text-sm font-medium">{photos.length} photo(s)</span>
                  </div>
                  <div className="py-2">
                    <span className="text-text-muted text-sm block mb-1">Description</span>
                    <span className="text-sm">{description}</span>
                  </div>
                </div>
                {coordinates && (
                  <div className="h-48 rounded-xl overflow-hidden border border-border">
                    <IssueMap selectedPosition={coordinates} height="192px" showClusters={false} interactive={false} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(Math.min(4, step + 1))}
                disabled={step === 1 && !coordinates}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Submit Report
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
