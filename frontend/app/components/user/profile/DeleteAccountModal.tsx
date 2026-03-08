'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { profileApi } from '@/lib/userServiceApi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function DeleteAccountModal({ open, onClose }: Props) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open || !user) return null;

    const isConfirmed = confirm.trim().toLowerCase() === 'delete my account';

    const handleDelete = async () => {
        if (!isConfirmed) return;
        setLoading(true);
        try {
            await profileApi.deleteAccount();
            toast.success('Your account has been deleted.');
            logout();
            router.push('/login');
        } catch {
            toast.error('Failed to delete account. Please try again.');
            setLoading(false);
        }
    };

    const handleClose = () => {
        setConfirm('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

                <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 shrink-0 rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                <AlertTriangle size={15} className="text-red-500" />
                            </div>
                            <h2 className="font-bold text-lg text-red-600 dark:text-red-400">Delete Account</h2>
                        </div>
                        <button onClick={handleClose} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">

                        {/* Warning */}
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl space-y-2">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">This action is permanent and irreversible.</p>
                            <ul className="text-xs text-red-600/80 dark:text-red-400/70 space-y-1 list-disc list-inside">
                                <li>Your account will be permanently deleted</li>
                                <li>Your avatar and all associated data will be removed</li>
                                <li>You will be immediately logged out</li>
                                <li>This cannot be undone</li>
                            </ul>
                        </div>

                        {/* User preview */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.fullname} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">
                                        {user.fullname.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.fullname}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Confirmation input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Type <span className="font-mono text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded text-xs">delete my account</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="delete my account"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-red-400 dark:focus:border-red-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <button type="button" onClick={handleClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={!isConfirmed || loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Deleting...' : 'Delete My Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}