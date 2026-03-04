'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2, Pencil, MapPin, Phone, Mail, Clock, Camera,
  X, Upload, ImageOff, ZoomIn, ChevronDown, Share2,
} from 'lucide-react';
import { companyApi, Company } from '@/lib/adminServiceApi';
import EditCompanyModal from '@/components/admin/company/EditCompanyModal';
import toast from 'react-hot-toast';
import { useCompany } from '@/context/CompanyContext';

// ── Social platform config ─────────────────────────────────────────────────────
const SOCIAL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  facebook:  { label: 'Facebook',    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  twitter:   { label: 'Twitter / X', color: 'text-sky-500 dark:text-sky-400',     bg: 'bg-sky-50 dark:bg-sky-900/20' },
  youtube:   { label: 'YouTube',     color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20' },
  instagram: { label: 'Instagram',   color: 'text-pink-600 dark:text-pink-400',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
  whatsapp:  { label: 'WhatsApp',    color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  tiktok:    { label: 'TikTok',      color: 'text-gray-900 dark:text-gray-100',   bg: 'bg-gray-100 dark:bg-gray-700' },
};

// ── Logo Zoom Modal ────────────────────────────────────────────────────────────
function LogoZoomModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
        <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
          <img src={url} alt={name} className="w-full h-full object-cover" />
        </div>
        <p className="text-center mt-3 text-sm font-medium text-white/80">{name}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CompanyClient() {
  const [company, setCompany]   = useState<Company | null>(null);
  const [loading, setLoading]   = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [zoomOpen, setZoomOpen]           = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoDeleting, setLogoDeleting]   = useState(false);
  const [logoPreview, setLogoPreview]     = useState<string | null>(null);
  const [pendingFile, setPendingFile]     = useState<File | null>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const { refreshCompany }                = useCompany();

  const fetchCompany = async () => {
    try {
      const res = await companyApi.get();
      setCompany(res.data ?? null);
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompany(); }, []);

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };

  const workingDatetime = company?.working_datetime
    ? typeof company.working_datetime === 'string'
      ? (() => { try { return JSON.parse(company.working_datetime); } catch { return null; } })()
      : company.working_datetime
    : null;

  const currentLogoUrl = company?.logo_url ?? null;

  const parsedSocialMedia = company?.social_media
  ? typeof company.social_media === 'string'
    ? (() => { try { return JSON.parse(company.social_media); } catch { return null; } })()
    : company.social_media
  : null;

  const socialEntries = parsedSocialMedia
    ? (Object.entries(parsedSocialMedia) as [string, string][]).filter(([, url]) => url?.trim())
    : [];

  // ── Logo Handlers ──────────────────────────────────────────────────────────
  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be smaller than 2 MB.'); return; }
    setPendingFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setDropdownOpen(false);
    e.target.value = '';
  }

  function cancelPreview() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setPendingFile(null);
  }

  async function uploadLogo() {
    if (!pendingFile) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', pendingFile);
      await companyApi.changeLogo(fd);
      await fetchCompany();
      cancelPreview();
      toast.success('Logo updated successfully!');
      refreshCompany();
    } catch {
      toast.error('Failed to update logo.');
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleDeleteLogo() {
    setDropdownOpen(false);
    setLogoDeleting(true);
    try {
      await companyApi.deleteLogo();
      await fetchCompany();
      toast.success('Logo removed.');
      refreshCompany();
    } catch {
      toast.error('Failed to remove logo.');
    } finally {
      setLogoDeleting(false);
    }
  }

  return (
    <>
      {/* Zoom Modal */}
      {zoomOpen && currentLogoUrl && (
        <LogoZoomModal
          url={currentLogoUrl}
          name={company?.name ?? 'Logo'}
          onClose={() => setZoomOpen(false)}
        />
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />

      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <Building2 size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Company Info</h1>
              <p className="text-sm text-gray-400">Manage your restaurant's public information</p>
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
          >
            <Pencil size={15} />
            {company ? 'Edit Info' : 'Setup Info'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !company && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Building2 size={28} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No company info yet.</p>
            <button
              onClick={() => setEditOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
            >
              Setup Now
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && company && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Identity card */}
            <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center gap-5">

              {/* Logo with camera controls */}
              <div className="flex flex-col items-center gap-2 shrink-0">

                <div className="relative">
                  {logoPreview ? (
                    <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden">
                      <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : currentLogoUrl ? (
                    <button
                      onClick={() => setZoomOpen(true)}
                      className="w-20 h-20 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden block relative group/zoom"
                      title="View full logo"
                    >
                      <img src={currentLogoUrl} alt="logo" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                        <ZoomIn size={18} className="text-white" />
                      </span>
                    </button>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Building2 size={30} className="text-gray-300 dark:text-gray-600" />
                    </div>
                  )}

                  {logoDeleting && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Camera button + dropdown */}
                {!logoPreview && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(v => !v)}
                      disabled={logoDeleting}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <Camera size={12} />
                      Logo
                      <ChevronDown size={11} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-30 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
                          <button
                            onClick={() => { setDropdownOpen(false); fileInputRef.current?.click(); }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                              <Upload size={13} className="text-brand-500" />
                            </span>
                            <span>Upload new logo</span>
                          </button>

                          {currentLogoUrl && (
                            <button
                              onClick={() => { setDropdownOpen(false); setZoomOpen(true); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <ZoomIn size={13} className="text-blue-500" />
                              </span>
                              <span>View logo</span>
                            </button>
                          )}

                          {currentLogoUrl && (
                            <>
                              <div className="my-1 mx-3 border-t border-gray-100 dark:border-gray-700" />
                              <button
                                onClick={handleDeleteLogo}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <span className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                  <ImageOff size={13} className="text-red-500" />
                                </span>
                                <span>Remove logo</span>
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Preview confirm/cancel */}
                {logoPreview && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelPreview}
                      disabled={logoUploading}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <X size={11} /> Cancel
                    </button>
                    <button
                      onClick={uploadLogo}
                      disabled={logoUploading}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-60"
                    >
                      {logoUploading ? (
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Upload size={11} />
                      )}
                      {logoUploading ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {/* Name + address */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
                {company.address && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1.5">
                    <MapPin size={13} /> {company.address}
                  </p>
                )}
              </div>
            </div>

            {/* Phones */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={15} className="text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Numbers</h3>
              </div>
              {company.phones?.length ? (
                company.phones.map((p, i) => (
                  <p key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl">{p}</p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No phones added.</p>
              )}
            </div>

            {/* Emails */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail size={15} className="text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Addresses</h3>
              </div>
              {company.emails?.length ? (
                company.emails.map((e, i) => (
                  <p key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl">{e}</p>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No emails added.</p>
              )}
            </div>

            {/* Social Media */}
            {socialEntries.length > 0 && (
              <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 size={15} className="text-brand-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Social Media</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {socialEntries.map(([platform, url]) => {
                    const config = SOCIAL_CONFIG[platform] ?? {
                      label: platform,
                      color: 'text-gray-700 dark:text-gray-300',
                      bg: 'bg-gray-50 dark:bg-gray-800',
                    };
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all group ${config.bg}`}
                      >
                        <span className={`text-xs font-semibold truncate ${config.color}`}>
                          {config.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Google Maps */}
            {company.location_url && (
              <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-brand-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</h3>
                </div>
                <div className="rounded-xl overflow-hidden h-56 border border-gray-100 dark:border-gray-800">
                  <iframe
                    src={company.location_url}
                    className="w-full h-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* Working Hours */}
            {workingDatetime && (
              <div className="col-span-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={15} className="text-brand-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Working Hours</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {days.map(day => {
                    const info = workingDatetime?.[day];
                    return (
                      <div key={day} className={`rounded-xl p-3 border ${info && !info.closed ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-900/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{dayLabels[day]}</p>
                        {info && !info.closed ? (
                          <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">{info.open} – {info.close}</p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">Closed</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        <EditCompanyModal
          open={editOpen}
          company={company}
          onClose={() => setEditOpen(false)}
          onSuccess={() => { setEditOpen(false); fetchCompany(); }}
        />
      </div>
    </>
  );
}