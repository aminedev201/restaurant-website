'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { profileApi } from '@/lib/adminServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ open, onClose, onSuccess }: Props) {
  const { user, refreshUser } = useAuth();

  const [fullname, setFullname] = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [avatar, setAvatar]     = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullname(user.fullname);
      setEmail(user.email);
      setPhone(user.phone ?? '');
      setPreview(user.avatar_url ?? null);
      setAvatar(null);
      setErrors({});
    }
  }, [user, open]);

  if (!open || !user) return null;

  const handleAvatar = (file: File) => {
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleAvatar(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullname.trim())                             errs.fullname = 'Full name is required.';
    else if (fullname.trim().length < 2)              errs.fullname = 'Full name must be at least 2 characters.';
    else if (!/^[a-zA-Z\s]+$/.test(fullname.trim())) errs.fullname = 'Full name must contain letters only.';
    if (!email.trim())                                errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.';
    if (!phone.trim())                                errs.phone = 'Phone number is required.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullname', fullname);
      fd.append('email', email);
      fd.append('phone', phone);
      if (avatar) fd.append('avatar', avatar);
      await profileApi.update(fd);
      await refreshUser();
      toast.success('Profile updated successfully!');
      onSuccess();
    } catch (err: unknown) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Edit Profile</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} id="edit-profile-form" className="p-6 space-y-5">
              {errors.api && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{errors.api}</p>
              )}

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar</label>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 bg-gray-50 dark:bg-gray-800/50 transition-colors"
                >
                  {preview ? (
                    <div className="relative h-32 rounded-xl overflow-hidden">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <ImageIcon size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 2MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current avatar</p>
              </div>

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" value={fullname} onChange={e => setFullname(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.fullname ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`} />
                {errors.fullname && <p className="text-xs text-red-500 mt-1">{errors.fullname}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.email ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
                    ${errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" form="edit-profile-form" disabled={loading}
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