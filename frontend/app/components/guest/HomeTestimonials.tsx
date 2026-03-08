'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { testimonialsApi, Testimonial } from '@/lib/publicServiceApi';
import { testimonialsApi as userTestimonialsApi } from '@/lib/userServiceApi';

const INTERVAL = 5000;

// ─── Star Rating Input ────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            size={24}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Submit Form ──────────────────────────────────────────────────────────────
function TestimonialForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return; }
    if (comment.trim().length < 10) { setError('Comment must be at least 10 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await userTestimonialsApi.store({ rating, comment: comment.trim() });
      setSuccess(true);
      onSubmitted();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-emerald-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Thank you for your review!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your testimonial has been submitted and is pending approval.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-sm dark:shadow-none">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Share Your Experience</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        How was your visit? Your review helps others discover us.
      </p>

      {/* Star picker */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Your Rating
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tell us about your experience..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-4">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm hover:shadow-amber-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send size={14} />
        )}
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function HomeTestimonials() {
  const { isAuthenticated, user } = useAuth();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading]           = useState(true);
  const [current, setCurrent]           = useState(0);
  const [paused, setPaused]             = useState(false);
  const [animKey, setAnimKey]           = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isUser = isAuthenticated && user?.role === 'user';

  const fetchTestimonials = () => {
    testimonialsApi.getAll()
      .then((res) => setTestimonials(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const [checkingMine, setCheckingMine] = useState(false);

  // Check if this user already submitted a testimonial
  useEffect(() => {
    if (!isUser) return;
    setCheckingMine(true);
    userTestimonialsApi.mine()
      .then((res) => setHasSubmitted(res.data?.exists ?? false))
      .catch(() => {})
      .finally(() => setCheckingMine(false));
  }, [isUser]);

  const goTo = (index: number) => {
    setCurrent(index);
    setAnimKey((k) => k + 1);
  };

  const next = () => goTo((current + 1) % testimonials.length);
  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (paused || testimonials.length === 0) return;
    timerRef.current = setTimeout(next, INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, testimonials.length]);

  const r = testimonials[current];

  return (
    <section className="relative py-20 md:py-28 bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glows */}
      <div className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-amber-400/5 dark:bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="h-px w-10 bg-amber-500/60" />
            <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
              Guest Stories
            </span>
            <div className="h-px w-10 bg-amber-500/60" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            What People{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
              Say
            </span>
          </h2>
        </div>

        {/* Slider */}
        {loading ? (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 animate-pulse">
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => <div key={i} className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700" />)}
            </div>
            <div className="space-y-3 mb-8">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <>
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-sm dark:shadow-none relative overflow-hidden">
                <Quote size={80} className="absolute top-6 right-6 text-amber-100 dark:text-amber-500/10 pointer-events-none" />

                <div key={animKey} style={{ animation: 'testimonialFade 0.5s ease both' }}>
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                    ))}
                    {[...Array(5 - r.rating)].map((_, i) => (
                      <Star key={i} size={18} className="text-gray-200 dark:text-gray-700" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
                    &ldquo;{r.comment}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    {r.user.avatar_url ? (
                      <img
                        src={r.user.avatar_url}
                        alt={r.user.fullname}
                        className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                        <span className="text-amber-700 dark:text-amber-300 font-bold text-sm">
                          {r.user.fullname.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.user.fullname}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">Verified User</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrows */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-200"
                    aria-label="Previous review"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-200"
                    aria-label="Next review"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Dots */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to review ${i + 1}`}
                    className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                    style={{
                      width: i === current ? 28 : 8,
                      background: i === current ? undefined : 'rgb(209 213 219)',
                    }}
                  >
                    {i === current && (
                      <span
                        className="absolute inset-0 rounded-full bg-amber-500 origin-left"
                        style={{
                          animation: paused ? 'none' : `dotProgress ${INTERVAL}ms linear forwards`,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Submit form — only for role=user who hasn't submitted yet */}
        {isUser && (
          <div className="mt-12">
            {checkingMine ? (
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6" />
                <div className="flex gap-2 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl mb-5" />
                <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </div>
            ) : !hasSubmitted ? (
              <TestimonialForm onSubmitted={() => { setHasSubmitted(true); fetchTestimonials(); }} />
            ) : null}
          </div>
        )}
      </div>

      <style>{`
        @keyframes testimonialFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes dotProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}