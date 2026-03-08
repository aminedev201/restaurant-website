'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ImageIcon, Loader2, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { chefApi, Chef } from '@/lib/adminServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';

interface Props {
  open: boolean;
  chef: Chef | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SOCIAL_FIELDS = [
  { key: 'facebook',  label: 'Facebook',  icon: Facebook,  placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { key: 'twitter',   label: 'Twitter',   icon: Twitter,   placeholder: 'https://twitter.com/...' },
  { key: 'youtube',   label: 'YouTube',   icon: Youtube,   placeholder: 'https://youtube.com/...' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: Linkedin,  placeholder: 'https://linkedin.com/...' },
] as const;

type SocialKey = typeof SOCIAL_FIELDS[number]['key'];

const URL_REGEX = /^https?:\/\/.+\..+/;

export default function EditChefModal({ open, chef, onClose, onSuccess }: Props) {
  const [fullname,  setFullname]  = useState('');
  const [position,  setPosition]  = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [status,    setStatus]    = useState(true);
  const [social,    setSocial]    = useState<Record<SocialKey, string>>({
    facebook: '', instagram: '', twitter: '', youtube: '', linkedin: '',
  });
  const [image,   setImage]   = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chef) {
      setFullname(chef.fullname);
      setPosition(chef.position);
      setShortDesc(chef.short_desc ?? '');
      setStatus(chef.status);
      setPreview(chef.image_url);
      setImage(null);
      setErrors({});
      setSocial({
        facebook:  chef.social_media?.facebook  ?? '',
        instagram: chef.social_media?.instagram ?? '',
        twitter:   chef.social_media?.twitter   ?? '',
        youtube:   chef.social_media?.youtube   ?? '',
        linkedin:  chef.social_media?.linkedin  ?? '',
      });
    }
  }, [chef]);

  if (!open || !chef) return null;

  const handleImage = (file: File) => { setImage(file); setPreview(URL.createObjectURL(file)); };
  const handleDrop  = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleImage(f);
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!fullname.trim())                             errs.fullname = 'Full name is required.';
    else if (fullname.trim().length < 2)              errs.fullname = 'Full name must be at least 2 characters.';
    else if (fullname.trim().length > 255)            errs.fullname = 'Full name may not exceed 255 characters.';
    else if (!/^[a-zA-Z\s]+$/.test(fullname.trim())) errs.fullname = 'Full name must contain letters only.';

    if (!position.trim())                             errs.position = 'Position is required.';
    else if (position.trim().length < 2)              errs.position = 'Position must be at least 2 characters.';
    else if (position.trim().length > 255)            errs.position = 'Position may not exceed 255 characters.';

    if (shortDesc.length > 500)                       errs.short_desc = 'Short description may not exceed 500 characters.';

    SOCIAL_FIELDS.forEach(({ key, label }) => {
      if (social[key] && !URL_REGEX.test(social[key]))
        errs[`social_${key}`] = `${label} must be a valid URL.`;
    });

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      const fd = new FormData();
      fd.append('fullname',   fullname.trim());
      fd.append('position',   position.trim());
      fd.append('short_desc', shortDesc);
      fd.append('status',     status ? '1' : '0');
      if (image) fd.append('image', image);
      SOCIAL_FIELDS.forEach(({ key }) => {
        if (social[key].trim()) fd.append(`social_media[${key}]`, social[key].trim());
      });
      await chefApi.update(chef.id, fd);
      onSuccess();
      onClose();
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
    ${errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Edit Chef</h2>
              <p className="text-xs text-gray-400 mt-0.5">Editing: {chef.fullname}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} id="edit-chef-form" className="p-6 space-y-5">
              {errors.api && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{errors.api}</p>
              )}

              {/* Full name + Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={fullname} onChange={e => setFullname(e.target.value)} className={inputCls('fullname')} />
                  {errors.fullname && <p className="text-xs text-red-500 mt-1">{errors.fullname}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Position <span className="text-red-500">*</span></label>
                  <input type="text" value={position} onChange={e => setPosition(e.target.value)} className={inputCls('position')} />
                  {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Short Description</label>
                <textarea rows={3} value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={`${inputCls('short_desc')} resize-none`} />
                <div className="flex justify-between mt-1">
                  {errors.short_desc ? <p className="text-xs text-red-500">{errors.short_desc}</p> : <span />}
                  <p className="text-xs text-gray-400">{shortDesc.length}/500</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">Make this chef visible to visitors</p>
                </div>
                <button type="button" onClick={() => setStatus(s => !s)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${status ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${status ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Photo</label>
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 bg-gray-50 dark:bg-gray-800/50 transition-colors">
                  {preview ? (
                    <div className="relative h-40 rounded-xl overflow-hidden">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <ImageIcon size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span> or drag & drop
                      </p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current photo</p>
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Media <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="space-y-3">
                  {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <Icon size={15} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                          type="url"
                          value={social[key]}
                          onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className={inputCls(`social_${key}`)}
                        />
                      </div>
                      {errors[`social_${key}`] && <p className="text-xs text-red-500 mt-1 ml-11">{errors[`social_${key}`]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" form="edit-chef-form" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}