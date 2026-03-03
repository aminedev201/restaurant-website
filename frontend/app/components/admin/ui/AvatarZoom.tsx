'use client';

import { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface AvatarZoomProps {
  url: string;
  name: string;
  /** Thumbnail size classes — default "w-10 h-10" */
  size?: string;
  /** Extra classes on the thumbnail wrapper */
  className?: string;
}

/**
 * Clickable avatar thumbnail that opens a fullscreen lightbox.
 * Closes on backdrop click, X button, or Escape key.
 */
export default function AvatarZoom({ url, name, size = 'w-10 h-10', className = '' }: AvatarZoomProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative focus:outline-none cursor-zoom-in rounded-xl overflow-hidden shrink-0 ${size} ${className}`}
        title="Click to enlarge">
        <img src={url} alt={name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-200">
          <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </div>
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={20} />
          </button>
          <img
            src={url}
            alt={name}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-5 text-white/60 text-sm font-medium pointer-events-none">{name}</p>
        </div>
      )}
    </>
  );
}