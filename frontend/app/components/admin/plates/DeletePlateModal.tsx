'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { plateApi, Plate } from '@/lib/adminServiceApi';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';

interface Props {
  open: boolean;
  plate: Plate | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeletePlateModal({ open, plate, onClose, onSuccess }: Props) {

    if (!open || !plate) return null;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!plate) return;
    setLoading(true);
    try {
      await plateApi.delete(plate.id);
      toast.success(`"${plate.name}" deleted successfully.`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to delete plate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      title="Delete Plate"
      loading={loading}
      onConfirm={handleDelete}
      onClose={onClose}
      description={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            &ldquo;{plate?.name}&rdquo;
          </span>?
          <br />
          This action <span className="text-red-500 font-medium">cannot be undone</span> and
          will also remove the associated image.
          {plate && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left">
              <img src={plate.image_url} alt={plate.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{plate.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{plate.price.toFixed(2)} MAD · {plate.category?.name}</p>
              </div>
            </div>
          )}
        </>
      }
    />
  );
}