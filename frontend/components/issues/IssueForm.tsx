'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { Photo } from '@/types';
import toast from 'react-hot-toast';

interface IssueFormPhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

export default function IssueFormPhotoUpload({ photos, onPhotosChange }: IssueFormPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length + acceptedFiles.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    setUploading(true);
    const newPhotos: Photo[] = [...photos];

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      if (file.size < 5 * 1024) {
        toast.error(`${file.name} is too small (minimum 5KB)`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }

      setProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));

      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/api/upload/image', formData, {
          headers: { 'Content-Type': undefined },
        });
        newPhotos.push(res.data);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    onPhotosChange(newPhotos);
    setUploading(false);
    setProgress(0);
  }, [photos, onPhotosChange]);

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif', '.gif'] },
    maxFiles: 5 - photos.length,
    disabled: uploading || photos.length >= 5,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-primary bg-primary/5 shadow-[inset_0_0_20px_rgba(232,148,58,0.1)]'
            : photos.length >= 5
            ? 'border-white/[0.03] opacity-50 cursor-not-allowed bg-[#0A0A0A]'
            : 'border-white/[0.06] hover:border-primary/50 bg-[#0A0A0A] hover:bg-[#141414]'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
            <div className="w-56 mx-auto bg-surface-3 rounded-full h-2 overflow-hidden border border-white/[0.03]">
              <motion.div
                className="h-full bg-primary rounded-full shadow-[0_0_10px_var(--tw-colors-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            <p className="text-sm text-primary font-medium tracking-wide">Uploading... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-2 border border-white/[0.06] flex items-center justify-center mb-2">
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-text-muted'}`} />
            </div>
            <p className="text-sm text-text-primary font-medium tracking-wide">
              {isDragActive ? 'Drop photos here' : 'Drag & drop photos or click to browse'}
            </p>
            <p className="text-xs text-text-muted font-mono bg-surface-2 inline-block px-3 py-1 rounded-full border border-white/[0.03]">
              1–5 photos • 5KB–5MB • JPEG/PNG/WEBP
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <AnimatePresence>
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.publicId}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative rounded-xl overflow-hidden aspect-square group border border-white/[0.06] shadow-lg"
              >
                <img
                  src={photo.thumbnail || photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                    className="w-10 h-10 bg-danger/90 rounded-full flex items-center justify-center hover:bg-danger hover:scale-110 transition-all shadow-[0_0_15px_rgba(248,113,113,0.5)]"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/[0.1]">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
