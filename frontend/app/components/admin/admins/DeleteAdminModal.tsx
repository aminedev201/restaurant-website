'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/adminServiceApi';
import { User } from '@/types';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAdminModal({ open, user, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  if (!open || !user) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await adminApi.delete(user.id);
      toast.success(`"${user.fullname}" deleted successfully.`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to delete admin.');
    } finally {
      setLoading(false);
    }
  };

  const initials = user.fullname
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ConfirmModal
      open={open}
      title="Delete Admin"
      loading={loading}
      onConfirm={handleDelete}
      onClose={onClose}
      description={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            &ldquo;{user.fullname}&rdquo;
          </span>
          ?<br />
          This action{' '}
          <span className="text-red-500 font-medium">cannot be undone</span> and
          will also remove their avatar.
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.fullname}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user.fullname}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </>
      }
    />
  );
}