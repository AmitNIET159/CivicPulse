import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const DRAFT_VERSION = 1;
const DRAFT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface IssueDraftData {
  category: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number } | null;
}

interface StoredDraft {
  version: number;
  savedAt: number;
  data: IssueDraftData;
}

export function useIssueDraft() {
  const { user } = useAuthStore();
  
  // We use a state to indicate if a draft was found and is ready to be restored
  const [draftAvailable, setDraftAvailable] = useState<IssueDraftData | null>(null);
  
  // Helper to get the correct storage key based on the authenticated user
  const getDraftKey = useCallback(() => {
    if (!user?._id) return null;
    return `civicpulse:issue-draft:${user._id}`;
  }, [user]);

  // Load draft on mount
  useEffect(() => {
    const key = getDraftKey();
    if (!key) return;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: StoredDraft = JSON.parse(stored);
        
        // Check version compatibility and expiration
        const isExpired = Date.now() - parsed.savedAt > DRAFT_EXPIRATION_MS;
        if (parsed.version === DRAFT_VERSION && !isExpired) {
          // If it's empty, don't offer to restore
          const d = parsed.data;
          if (d.category || d.description || d.address || d.coordinates) {
            setDraftAvailable(parsed.data);
          }
        } else {
          // Discard stale or incompatible drafts
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Failed to parse issue draft:', e);
      localStorage.removeItem(key);
    }
  }, [getDraftKey]);

  // Save draft - can be wrapped in a debounce by the caller
  const saveDraft = useCallback((data: IssueDraftData) => {
    const key = getDraftKey();
    if (!key) return;
    
    // Do not save completely empty forms
    if (!data.category && !data.description && !data.address && !data.coordinates) {
      return;
    }

    try {
      const draft: StoredDraft = {
        version: DRAFT_VERSION,
        savedAt: Date.now(),
        data,
      };
      localStorage.setItem(key, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save issue draft:', e);
    }
  }, [getDraftKey]);

  // Clear draft
  const clearDraft = useCallback(() => {
    const key = getDraftKey();
    if (key) {
      localStorage.removeItem(key);
    }
    setDraftAvailable(null);
  }, [getDraftKey]);

  return {
    draftAvailable,
    saveDraft,
    clearDraft,
  };
}
