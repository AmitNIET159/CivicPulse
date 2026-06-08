'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
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
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : photos.length >= 5
            ? 'border-border/30 opacity-50 cursor-not-allowed'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
            <div className="w-48 mx-auto bg-border rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-text-muted">Uploading... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-text-muted" />
            <p className="text-sm text-text-primary font-medium">
              {isDragActive ? 'Drop photos here' : 'Drag & drop photos or click to browse'}
            </p>
            <p className="text-xs text-text-muted">
              1–5 photos, 5KB–5MB each • JPEG, PNG, WebP, AVIF, GIF
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <AnimatePresence>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.publicId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative rounded-lg overflow-hidden aspect-video group"
              >
                <img
                  src={photo.thumbnail || photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-danger rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <div className="absolute bottom-1 left-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
