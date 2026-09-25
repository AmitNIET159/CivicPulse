'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, FileText, Camera, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { CATEGORY_CONFIG, Photo } from '@/types';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useIssueDraft } from '@/hooks/useIssueDraft';
import GPSLocator from '@/components/map/GPSLocator';
import IssueFormPhotoUpload from '@/components/issues/IssueForm';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DepthCard from '@/components/ui/DepthCard';

const IssueMap = dynamic(() => import('@/components/map/IssueMap'), { ssr: false });

export default function ReportPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const { draftAvailable, saveDraft, clearDraft } = useIssueDraft();
  const [draftHandled, setDraftHandled] = useState(false);

  useEffect(() => {
    // If an unhandled draft exists, check if user is making new manual edits to ignore it
    if (draftAvailable && !draftHandled) {
      if (category || description || address || coordinates) {
        setDraftHandled(true);
      }
      return;
    }

    const handler = setTimeout(() => {
      saveDraft({ category, description, address, coordinates });
    }, 1000);
    return () => clearTimeout(handler);
  }, [category, description, address, coordinates, saveDraft, draftAvailable, draftHandled]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <DepthCard className="p-8">
          <MapPin className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Login Required</h2>
          <p className="text-text-muted mb-6">You need to be logged in to report an issue.</p>
          <Link href="/login" className="px-6 py-3 bg-primary text-background rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-block w-full">
            Login to Continue
          </Link>
        </DepthCard>
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
    if (!category) { toast.error('Please select a category'); return; }
    if (!description.trim()) { toast.error('Please add a description'); return; }
    if (photos.length < 1) { toast.error('Please upload at least 1 photo'); return; }
    if (photos.length > 5) { toast.error('Maximum 5 photos allowed'); return; }

    setSubmitting(true);
    try {
      const autoTitle = description.trim().slice(0, 100);
      const res = await api.post('/api/issues', {
        title: autoTitle,
        description: description.trim(),
        category,
        coordinates,
        address,
        photos,
      });
      clearDraft();
      toast.success('Issue reported successfully!');
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
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Report an Issue</h1>
        <p className="text-text-muted mb-8">Help improve your community by reporting civic problems.</p>

        {draftAvailable && !draftHandled && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-surface-2 border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(232,148,58,0.1)]">
            <div>
              <h3 className="font-semibold text-primary text-sm flex items-center gap-2"><FileText className="w-4 h-4"/> Unfinished Draft Found</h3>
              <p className="text-xs text-text-muted mt-1">You have an unsaved issue report. Would you like to restore it?</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { clearDraft(); setDraftHandled(true); }} className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-white transition-colors">Discard</button>
              <button onClick={() => { setCategory(draftAvailable.category || ''); setDescription(draftAvailable.description || ''); setAddress(draftAvailable.address || ''); setCoordinates(draftAvailable.coordinates || null); setDraftHandled(true); toast.success('Draft restored'); }} className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-medium hover:bg-primary hover:text-white transition-colors">Restore Draft</button>
            </div>
          </motion.div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  step === s.num ? 'bg-primary text-background border border-primary/20 shadow-[0_0_15px_rgba(232,148,58,0.2)]' : step > s.num ? 'bg-primary/10 text-primary border border-primary/10' : 'bg-[#1A1A1A] text-text-muted border border-white/[0.06]'
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 rounded-full ${step > s.num ? 'bg-[linear-gradient(90deg,var(--tw-colors-primary),#E8943A)]' : 'bg-surface-3'}`} />
              )}
            </div>
          ))}
        </div>

        <DepthCard depth="medium" className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Location */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold mb-1 text-text-primary">Pin the Location</h2>
                <p className="text-sm text-text-muted mb-4">Click on the map or use GPS to set the issue location.</p>
                <div className="flex gap-3 mb-4">
                  <GPSLocator onLocationFound={handleGPS} />
                </div>
                {/* No 3D on map container */}
                <div className="h-[350px] rounded-xl overflow-hidden border border-white/[0.06] bg-surface-2" style={{ transformStyle: 'flat', perspective: 'none' }}>
                  <IssueMap
                    onMapClick={handleMapClick}
                    selectedPosition={coordinates}
                    height="350px"
                    showClusters={false}
                  />
                </div>
                {coordinates && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-text-muted font-mono bg-surface-2 p-2 rounded-lg inline-block border border-white/[0.03]">
                      <span className="text-primary mr-1">📍</span>
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Address (auto-filled, editable)"
                      className="w-full bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Issue Details</h2>
                <div>
                  <label className="text-sm font-medium text-text-muted mb-2 block">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCategory(key)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                          category === key ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(232,148,58,0.1)]' : 'border-white/[0.06] bg-[#141414] hover:border-primary/30 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className={category === key ? 'text-primary' : 'text-text-muted'}>{config.icon}</span>
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <label className="text-sm font-medium text-text-muted mb-2 block">Description</label>
                  <div className="relative">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                      placeholder="Describe the issue in detail..."
                      rows={5}
                      className="w-full bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 resize-none transition-colors"
                    />
                    <span className="absolute right-3 bottom-3 text-xs text-text-muted font-mono bg-[#0A0A0A] px-1">
                      {description.length}/1000
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Add Photos</h2>
                <p className="text-sm text-text-muted">Upload photos of the issue (at least 1 required, max 5).</p>
                <div className="pt-2">
                  <IssueFormPhotoUpload photos={photos} onPhotosChange={setPhotos} />
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold text-text-primary">Review & Submit</h2>
                <div className="space-y-4 bg-surface-2 p-4 rounded-xl border border-white/[0.03]">
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-text-muted text-sm">Category</span>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                      {CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.icon}
                      {CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]?.label || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-text-muted text-sm">Location</span>
                    <span className="text-sm font-medium truncate max-w-[200px] text-right text-text-primary">{address || 'Map pin set'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-text-muted text-sm">Photos</span>
                    <span className="text-sm font-mono text-text-primary">{photos.length} uploaded</span>
                  </div>
                  <div className="py-2">
                    <span className="text-text-muted text-sm block mb-2">Description</span>
                    <p className="text-sm text-text-primary leading-relaxed bg-[#0A0A0A] p-3 rounded-lg border border-white/[0.03]">{description}</p>
                  </div>
                </div>
                {coordinates && (
                  <div className="h-48 rounded-xl overflow-hidden border border-white/[0.06]" style={{ transformStyle: 'flat', perspective: 'none' }}>
                    <IssueMap selectedPosition={coordinates} height="192px" showClusters={false} interactive={false} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors bg-surface rounded-lg border border-transparent hover:border-white/[0.06]"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(Math.min(4, step + 1))}
                disabled={step === 1 && !coordinates}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-background rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(232,148,58,0.2)]"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-background rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(232,148,58,0.3)]"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Submit Report
              </button>
            )}
          </div>
        </DepthCard>
      </motion.div>
    </div>
  );
}



