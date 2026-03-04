'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChefHat, MapPin, Phone, Mail,
  Instagram, Facebook, Twitter, Youtube, MessageCircle,
} from 'lucide-react';
import { Company, companyApi, WorkingDay } from '@/lib/publicService.Api';

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseSocialMedia(raw: Company['social_media']): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function parseWorkingDatetime(raw: Company['working_datetime']): Record<string, WorkingDay> | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function fmt(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${m.toString().padStart(2, '0')}${ampm}`;
}

const DAYS_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

function groupSchedule(schedule: Record<string, WorkingDay>) {
  const groups: { label: string; hours: string; highlight: boolean }[] = [];
  let i = 0;
  while (i < DAYS_ORDER.length) {
    const day = DAYS_ORDER[i];
    const info = schedule[day];
    if (!info) { i++; continue; }
    let j = i + 1;
    while (j < DAYS_ORDER.length) {
      const next = schedule[DAYS_ORDER[j]];
      if (next && next.closed === info.closed && next.open === info.open && next.close === info.close) j++;
      else break;
    }
    const start = DAY_LABELS[day].slice(0, 3);
    const end = DAY_LABELS[DAYS_ORDER[j - 1]].slice(0, 3);
    const label = j - i > 1 ? `${start} – ${end}` : DAY_LABELS[day];
    const hours = info.closed ? 'Closed' : `${fmt(info.open)} – ${fmt(info.close)}`;
    const highlight = !info.closed && (day === 'fri' || day === 'sat');
    groups.push({ label, hours, highlight });
    i = j;
  }
  return groups;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  whatsapp: MessageCircle,
  tiktok: ({ size, ...p }: { size?: number }) => (
    <svg width={size ?? 15} height={size ?? 15} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z" />
    </svg>
  ),
};

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-800 ${className}`} />;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Footer() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyApi.get()
      .then(res => setCompany(res.data ?? null))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const social = parseSocialMedia(company?.social_media);
  const schedule = parseWorkingDatetime(company?.working_datetime ?? null);
  const hours = schedule ? groupSchedule(schedule) : [];
  const socialLinks = Object.entries(social).filter(([, url]) => url?.trim());

  const phones = company?.phones?.filter(Boolean) ?? [];
  const emails = company?.emails?.filter(Boolean) ?? [];

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {loading ? (
                <Skeleton className="w-14 h-14 rounded-full" />
              ) : company?.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                  <ChefHat size={18} className="text-white" />
                </div>
              )}
              {loading ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                <span className="font-display text-2xl font-bold text-white">
                  {company?.name ?? 'Restaurant'}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              An intimate dining experience where tradition meets modern gastronomy. Every dish tells a story.
            </p>

            {/* Social icons */}
            {loading ? (
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-9 h-9 rounded-full" />)}
              </div>
            ) : socialLinks.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map(([platform, url]) => {
                  const Icon = SOCIAL_ICONS[platform];
                  if (!Icon) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                      className="w-9 h-9 bg-gray-800 hover:bg-brand-500 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Icon size={15} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-display tracking-wide">Explore</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/menu', 'Our Menu'], ['/booking', 'Reserve a Table'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-display tracking-wide">Opening Hours</h4>
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : hours.length > 0 ? (
              <ul className="space-y-1.5">
                {hours.map((g, i) => {
                  const isClosed = g.hours === 'Closed';
                  return (
                    <li
                      key={i}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                        ${isClosed
                          ? 'bg-gray-900/60 text-gray-600'
                          : g.highlight
                            ? 'bg-brand-500/10 border border-brand-500/20'
                            : 'bg-gray-900/40'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isClosed ? 'bg-gray-700' : 'bg-brand-400'}`} />
                        <span className={isClosed ? 'text-gray-600' : 'text-gray-300'}>{g.label}</span>
                      </div>
                      <span className={`font-medium tabular-nums text-xs ${isClosed ? 'text-gray-700' : g.highlight ? 'text-brand-400' : 'text-gray-400'}`}>
                        {g.hours}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-display tracking-wide">Contact</h4>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-4 h-4 mt-0.5 shrink-0 rounded" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-3">

                {/* Address */}
                {company?.address && (
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <MapPin size={15} className="text-brand-400 mt-0.5 shrink-0" />
                    <span>{company.address}</span>
                  </li>
                )}

                {/* Phones — one icon, all numbers stacked */}
                {phones.length > 0 && (
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Phone size={15} className="text-brand-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-1">
                      {phones.map((phone, i) => (
                        <a key={i} href={`tel:${phone}`} className="hover:text-brand-400 transition-colors">
                          {phone}
                        </a>
                      ))}
                    </div>
                  </li>
                )}

                {/* Emails — one icon, all addresses stacked */}
                {emails.length > 0 && (
                  <li className="flex items-start gap-3 text-sm text-gray-400">
                    <Mail size={15} className="text-brand-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-1">
                      {emails.map((email, i) => (
                        <a key={i} href={`mailto:${email}`} className="hover:text-brand-400 transition-colors">
                          {email}
                        </a>
                      ))}
                    </div>
                  </li>
                )}

              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          {loading ? (
            <Skeleton className="h-3 w-64" />
          ) : (
            <p>© {new Date().getFullYear()} {company?.name ?? 'Restaurant'} Restaurant. All rights reserved.</p>
          )}
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}