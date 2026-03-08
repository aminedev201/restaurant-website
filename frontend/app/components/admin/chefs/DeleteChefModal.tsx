'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { chefApi, Chef } from '@/lib/adminServiceApi';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';

interface Props {
  open: boolean;
  chef: Chef | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteChefModal({ open, chef, onClose, onSuccess }: Props) {
  if (!open || !chef) return null;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await chefApi.delete(chef.id);
      toast.success(`"${chef.fullname}" deleted successfully.`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to delete chef.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      title="Delete Chef"
      loading={loading}
      onConfirm={handleDelete}
      onClose={onClose}
      description={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            &ldquo;{chef.fullname}&rdquo;
          </span>?
          <br />
          This action <span className="text-red-500 font-medium">cannot be undone</span> and
          will also remove the associated photo.
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left">
            <img src={chef.image_url} alt={chef.fullname} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{chef.fullname}</p>
              <p className="text-xs text-gray-400 mt-0.5">{chef.position}</p>
            </div>
          </div>
        </>
      }
    />
  );
}