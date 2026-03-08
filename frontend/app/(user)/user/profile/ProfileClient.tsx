'use client';

import { useState, useRef } from 'react';
import {
    User as UserIcon, Mail, Phone, Star, Calendar, Clock,
    CheckCircle2, ToggleRight, ToggleLeft, Edit2, KeyRound, LogOut, Trash2,
    Camera, X, Upload, ImageOff, ZoomIn, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import EditProfileModal from '@/components/user/profile/EditProfileModal';
import ChangeProfilePasswordModal from '@/components/user/profile/ChangeProfilePasswordModal';
import DeleteAccountModal from '@/components/user/profile/DeleteAccountModal';
import toast from 'react-hot-toast';
import { profileApi } from '@/lib/userServiceApi';


// ── Avatar Zoom Modal ──────────────────────────────────────────────────────────
function AvatarZoomModal({
    url, name, onClose,
}: { url: string; name: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative max-w-sm w-full"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                    <X size={15} />
                </button>
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={name} className="w-full h-full object-cover" />
                </div>
                <p className="text-center mt-3 text-sm font-medium text-white/80">{name}</p>
            </div>
        </div>
    );
}


// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProfileClient() {
    const { user, logout, refreshUser } = useAuth();

    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    // Avatar state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarDeleting, setAvatarDeleting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user || user.role != 'user') return null;

    const initials = user.fullname
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const currentAvatarUrl = user.avatar_url;

    // ── Handlers ──
    function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file.'); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be smaller than 2 MB.'); return; }
        setPendingFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setDropdownOpen(false);
        e.target.value = '';
    }

    function cancelPreview() {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
        setPendingFile(null);
    }

    async function uploadAvatar() {
        if (!pendingFile) return;
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', pendingFile);
            await profileApi.changeAvatar(fd);
            await refreshUser?.();
            cancelPreview();
            toast.success('Avatar updated successfully!');
        } catch {
            toast.error('Failed to update avatar.');
        } finally {
            setAvatarUploading(false);
        }
    }

    async function handleDeleteAvatar() {
        setDropdownOpen(false);
        setAvatarDeleting(true);
        try {
            await profileApi.deleteAvatar();
            await refreshUser?.();
            toast.success('Avatar removed.');
        } catch {
            toast.error('Failed to remove avatar.');
        } finally {
            setAvatarDeleting(false);
        }
    }

    return (
        <>
            {/* ── Zoom Modal ── */}
            {zoomOpen && currentAvatarUrl && (
                <AvatarZoomModal
                    url={currentAvatarUrl}
                    name={user.fullname}
                    onClose={() => setZoomOpen(false)}
                />
            )}

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />

            <div className="">

                {/* ── Profile Card ── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

                    {/* Banner */}
                    <div className="relative h-36 bg-gradient-to-br from-brand-500/20 via-brand-400/10 to-transparent dark:from-brand-900/40 dark:via-brand-900/20 dark:to-transparent flex items-center justify-center">
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-brand-500/10" />
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-brand-500/5" />

                        {/* ── Avatar ── */}
                        <div className="relative z-10 flex flex-col items-center gap-2">

                            {/* Avatar image */}
                            <div className="relative group">
                                {avatarPreview ? (
                                    <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden">
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : currentAvatarUrl ? (
                                    <button
                                        onClick={() => setZoomOpen(true)}
                                        className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden block relative group/zoom"
                                        title="View full photo"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={currentAvatarUrl} alt={user.fullname} className="w-full h-full object-cover" />
                                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                            <ZoomIn size={18} className="text-white" />
                                        </span>
                                    </button>
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-brand-500 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-xl">
                                        <span className="text-white text-2xl font-bold">{initials}</span>
                                    </div>
                                )}

                                {/* Deleting spinner overlay */}
                                {avatarDeleting && (
                                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* ── Camera button + dropdown ── */}
                            {!avatarPreview && (
                                <div className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(v => !v)}
                                        disabled={avatarDeleting}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <Camera size={12} />
                                        Photo
                                        <ChevronDown size={11} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {dropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
                                            <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-30 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">

                                                {/* Upload */}
                                                <button
                                                    onClick={() => { setDropdownOpen(false); fileInputRef.current?.click(); }}
                                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                                                        <Upload size={13} className="text-brand-500" />
                                                    </span>
                                                    <span>Upload new photo</span>
                                                </button>

                                                {/* View — only if has avatar */}
                                                {currentAvatarUrl && (
                                                    <button
                                                        onClick={() => { setDropdownOpen(false); setZoomOpen(true); }}
                                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                        <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                            <ZoomIn size={13} className="text-blue-500" />
                                                        </span>
                                                        <span>View photo</span>
                                                    </button>
                                                )}

                                                {/* Divider + Remove — only if has avatar */}
                                                {currentAvatarUrl && (
                                                    <>
                                                        <div className="my-1 mx-3 border-t border-gray-100 dark:border-gray-700" />
                                                        <button
                                                            onClick={handleDeleteAvatar}
                                                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <span className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                                                <ImageOff size={13} className="text-red-500" />
                                                            </span>
                                                            <span>Remove photo</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Preview confirm/cancel */}
                            {avatarPreview && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={cancelPreview}
                                        disabled={avatarUploading}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 hover:bg-white transition-colors disabled:opacity-50"
                                    >
                                        <X size={11} /> Cancel
                                    </button>
                                    <button
                                        onClick={uploadAvatar}
                                        disabled={avatarUploading}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-60"
                                    >
                                        {avatarUploading ? (
                                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Upload size={11} />
                                        )}
                                        {avatarUploading ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status badge */}
                        <div className="absolute top-3 left-3 z-20">
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${user.status
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                }`}>
                                {user.status ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                                {user.status ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {user.email_verified_at && (
                            <div className="absolute top-3 right-3 z-20">
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                    <CheckCircle2 size={11} /> Verified
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Name + role */}
                    <div className="px-6 pt-4 pb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullname}</h2>
                        <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-semibold capitalize">
                            <Star size={11} /> {user.role}
                        </span>
                    </div>

                    {/* Fields */}
                    <div className="px-6 pb-6 mt-2 space-y-4">

                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                <UserIcon size={16} className="text-brand-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Full Name</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.fullname}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Mail size={16} className="text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Phone size={16} className="text-purple-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{user.phone ?? '—'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <Calendar size={15} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Joined</p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(user.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                <Clock size={15} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Updated</p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        {new Date(user.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(user.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2">
                        <button onClick={() => setEditOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-sm font-medium transition-colors">
                            <Edit2 size={15} /> Edit Profile
                        </button>
                        <button onClick={() => setPasswordOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-sm font-medium transition-colors">
                            <KeyRound size={15} /> Change Password
                        </button>
                        <button onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                </div>

                {/* ── Danger Zone ── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 overflow-hidden mt-2">
                    <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10">
                        <h3 className="font-bold text-red-600 dark:text-red-400 text-sm uppercase tracking-wide">Danger Zone</h3>
                        <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5">Irreversible and destructive actions</p>
                    </div>
                    <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete My Account</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Permanently delete your account and all associated data. This action{' '}
                                <span className="text-red-500 font-medium">cannot be undone</span>.
                            </p>
                        </div>
                        <button onClick={() => setDeleteOpen(true)}
                            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                            <Trash2 size={15} /> Delete Account
                        </button>
                    </div>
                </div>

                {/* ── Modals ── */}
                <EditProfileModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    onSuccess={() => setEditOpen(false)}
                />
                <ChangeProfilePasswordModal
                    open={passwordOpen}
                    onClose={() => setPasswordOpen(false)}
                    onSuccess={() => setPasswordOpen(false)}
                />
                <DeleteAccountModal
                    open={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                />
            </div>
        </>
    );
}