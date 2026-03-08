'use client';

import { X } from 'lucide-react';
import { Star } from 'lucide-react';
import { AdminTestimonial } from '@/lib/adminServiceApi';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'}
        />
      ))}
    </div>
  );
}

interface Props {
  testimonial: AdminTestimonial | null;
  onClose: () => void;
}

export default function TestimonialPreviewModal({ testimonial, onClose }: Props) {
  if (!testimonial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 mb-5">
          {testimonial.user.avatar_url ? (
            <img
              src={testimonial.user.avatar_url}
              alt={testimonial.user.fullname}
              className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <span className="text-amber-700 dark:text-amber-300 font-bold text-lg">
                {testimonial.user.fullname.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{testimonial.user.fullname}</p>
            <p className="text-xs text-gray-400">{testimonial.user.email}</p>
          </div>
        </div>

        {/* Rating */}
        <StarDisplay rating={testimonial.rating} />

        {/* Comment */}
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          &ldquo;{testimonial.comment}&rdquo;
        </p>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>
            {new Date(testimonial.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full font-medium ${
              testimonial.status
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            {testimonial.status ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}