'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ImageIcon, Loader2 } from 'lucide-react';
import { plateApi, categoryApi, Category } from '@/lib/adminServiceApi';
import { parseApiErrors } from '@/lib/parseApiErrors';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlateModal({ open, onClose, onSuccess }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName]             = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [shortDesc, setShortDesc]   = useState('');
  const [desc, setDesc]             = useState('');
  const [price, setPrice]           = useState('');
  const [oldPrice, setOldPrice]     = useState('');
  const [discount, setDiscount]     = useState('');
  const [status, setStatus]         = useState(true);
  const [image, setImage]           = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(false);
  const fileRef                     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) categoryApi.getActiveCats().then(r => setCategories(r.data)).catch(() => {});
  }, [open]);

  if (!open) return null;

  const handleImage = (file: File) => { setImage(file); setPreview(URL.createObjectURL(file)); };
  const handleDrop  = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleImage(f);
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!name.trim())            errs.name        = 'Plate name is required.';
    else if (name.length < 2)    errs.name        = 'Plate name must be at least 2 characters.';
    else if (name.length > 255)  errs.name        = 'Plate name may not exceed 255 characters.';

    if (!categoryId)             errs.category_id = 'Category is required.';

    if (!price)                  errs.price       = 'Price is required.';
    else if (isNaN(Number(price)) || Number(price) < 0)
                                 errs.price       = 'Price must be a valid non-negative number.';

    if (oldPrice && (isNaN(Number(oldPrice)) || Number(oldPrice) < 0))
                                 errs.old_price   = 'Old price must be a valid non-negative number.';

    if (discount) {
      const d = Number(discount);
      if (isNaN(d) || !Number.isInteger(d))
                                 errs.discount    = 'Discount must be a whole number.';
      else if (d < 0)            errs.discount    = 'Discount must be at least 0%.';
      else if (d > 100)          errs.discount    = 'Discount may not exceed 100%.';
    }

    if (shortDesc.length > 500)  errs.short_desc  = 'Short description may not exceed 500 characters.';

    if (!image)                  errs.image       = 'An image is required.';

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
      fd.append('category_id', categoryId);
      fd.append('name', name);
      fd.append('short_desc', shortDesc);
      fd.append('desc', desc);
      fd.append('price', price);
      if (oldPrice) fd.append('old_price', oldPrice);
      if (discount) fd.append('discount', discount);
      fd.append('status', status ? '1' : '0');
      if (image) fd.append('image', image);
      await plateApi.create(fd);
      onSuccess();
      handleClose();
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(''); setCategoryId(''); setShortDesc(''); setDesc('');
    setPrice(''); setOldPrice(''); setDiscount(''); setStatus(true);
    setImage(null); setPreview(null); setErrors({});
    onClose();
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors
    ${errors[field] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-brand-500 dark:focus:border-brand-400'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

          {/* Header — fixed */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Create Plate</h2>
            <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} id="create-plate-form" className="p-6 space-y-5">
              {errors.api && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">{errors.api}</p>
              )}

              {/* Row 1: Name + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Margherita Pizza" className={inputCls('name')} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls('category_id')}>
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
                </div>
              </div>

              {/* Row 2: Price + Old Price + Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={inputCls('price')} />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Old Price</label>
                  <input type="number" step="0.01" min="0" value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="0.00" className={inputCls('old_price')} />
                  {errors.old_price && <p className="text-xs text-red-500 mt-1">{errors.old_price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Discount (%)</label>
                  <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" className={inputCls('discount')} />
                  {errors.discount && <p className="text-xs text-red-500 mt-1">{errors.discount}</p>}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Short Description</label>
                <textarea rows={2} value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Brief description..." className={`${inputCls('short_desc')} resize-none`} />
                <div className="flex justify-between mt-1">
                  {errors.short_desc ? <p className="text-xs text-red-500">{errors.short_desc}</p> : <span />}
                  <p className="text-xs text-gray-400">{shortDesc.length}/500</p>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Description</label>
                <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Full description..." className={`${inputCls('desc')} resize-none`} />
                {errors.desc && <p className="text-xs text-red-500 mt-1">{errors.desc}</p>}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">Make this plate visible to customers</p>
                </div>
                <button type="button" onClick={() => setStatus(s => !s)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${status ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${status ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Image <span className="text-red-500">*</span></label>
                <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors
                    ${errors.image ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 bg-gray-50 dark:bg-gray-800/50'}`}>
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
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 2MB</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImage(f); }} />
                </div>
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>
            </form>
          </div>

          {/* Footer — fixed */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button type="button" onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" form="create-plate-form" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create Plate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}