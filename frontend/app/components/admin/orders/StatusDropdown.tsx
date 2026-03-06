'use client';

// components/admin/orders/StatusDropdown.tsx

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { Order } from '@/lib/adminServiceApi';

interface StatusDropdownProps {
  order: Order;
  field: 'status' | 'payment_status';
  options: { value: string; label: string; color: string }[];
  onUpdate: (id: number, value: string) => Promise<void>;
}

export default function StatusDropdown({ order, field, options, onUpdate }: StatusDropdownProps) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords]   = useState({ top: 0, left: 0 });
  const btnRef                = useRef<HTMLButtonElement>(null);
  const current               = options.find(o => o.value === order[field]);

  const handle = async (value: string) => {
    if (value === order[field]) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    await onUpdate(order.id, value);
    setLoading(false);
  };

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setOpen(v => !v);
  };

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  return (
    <div className="inline-flex" onClick={e => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loading}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap
          ${current?.color ?? ''} hover:opacity-80 disabled:opacity-50`}
      >
        {loading
          ? <RefreshCw size={10} className="animate-spin" />
          : current?.label ?? order[field]
        }
        <ChevronDown size={10} />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            style={{ top: coords.top, left: coords.left }}
            className="absolute z-[9999] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden w-max"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handle(opt.value)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                  ${order[field] === opt.value ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
              >
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${opt.color}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}