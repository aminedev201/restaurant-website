'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { categoryApi, Category } from '@/lib/adminServiceApi';
import ConfirmModal from '@/components/admin/ui/ConfirmModal';

interface Props {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteCategoryModal({ open, category, onClose, onSuccess }: Props) {
  
  if (!open || !category) return null;

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!category) return;
    setLoading(true);
    try {
      await categoryApi.delete(category.id);
      toast.success(`"${category.name}" deleted successfully.`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to delete category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal
      open={open}
      title="Delete Category"
      loading={loading}
      onConfirm={handleDelete}
      onClose={onClose}
      description={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            &ldquo;{category?.name}&rdquo;
          </span>
          ?<br />
          This action{' '}
          <span className="text-red-500 font-medium">cannot be undone</span> and
          will also remove the associated image.
          {category && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-left">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{category.name}</p>
                {category.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{category.description}</p>
                )}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}