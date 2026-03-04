'use client';

import { useEffect, useState } from 'react';
import { X, MailOpen, User, AtSign, MessageSquare, Clock, Trash2 } from 'lucide-react';
import { contactMessagesApi, ContactMessage } from '@/lib/adminServiceApi';

interface Props {
  open: boolean;
  message: ContactMessage | null;
  onClose: () => void;
  onDelete: (m: ContactMessage) => void;
  onMarkedRead: (id: number) => void;
}

export default function ShowContactMessageModal({ open, message, onClose, onDelete, onMarkedRead }: Props) {
  const [localMessage, setLocalMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!open || !message) return;

    setLocalMessage(message);

    // Call read API only if unread
    if (message.status === 'unread') {
      contactMessagesApi.read(message.id)
        .then(() => {
          setLocalMessage(prev => prev ? { ...prev, status: 'read' } : prev);
          onMarkedRead(message.id);
        })
        .catch(() => {
          // silently fail — don't block UI
        });
    }
  }, [open, message]);

  if (!open || !localMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <MailOpen size={16} className="text-brand-500" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Message Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Status + date */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${localMessage.status === 'unread'
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
              {localMessage.status === 'unread' ? '● Unread' : '✓ Read'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={11} />
              {new Date(localMessage.created_at).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>

          {/* Info cards */}
          {[
            { icon: User, label: 'Name', value: localMessage.name, href: null },
            { icon: AtSign, label: 'Email', value: localMessage.email, href: `mailto:${localMessage.email}` },
            { icon: MessageSquare, label: 'Subject', value: localMessage.subject, href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl min-w-0">
              <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={14} className="text-brand-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                {href ? (
                  <a href={href} className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand-500 transition-colors break-all">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">{value}</p>
                )}
              </div>
            </div>
          ))}

          {/* Message body */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Message</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {localMessage.message}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onDelete(localMessage); }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>

      </div>
    </div>
  );
}