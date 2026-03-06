'use client';

// app/admin/settings/SettingsClient.tsx

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Truck, Save, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { settingsAdminApi, Settings } from '@/lib/adminServiceApi';

export default function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [shipping, setShipping] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);
  const [error,    setError]    = useState('');

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsAdminApi.get();
      setSettings(res.data);
      setShipping(String(res.data.shipping));
      setDirty(false);
      setError('');
    } catch {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = (val: string): string => {
    if (val === '')                  return 'Shipping fee is required.';
    if (isNaN(parseFloat(val)))      return 'Must be a valid number.';
    if (parseFloat(val) < 0)         return 'Cannot be negative.';
    return '';
  };

  const handleChange = (val: string) => {
    setShipping(val);
    setDirty(parseFloat(val) !== settings?.shipping);
    setError(validate(val));
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const err = validate(shipping);
    if (err) { setError(err); return; }

    setSaving(true);
    try {
      const res = await settingsAdminApi.update(parseFloat(shipping));
      setSettings(res.data);
      setShipping(String(res.data.shipping));
      setDirty(false);
      setError('');
      toast.success('Settings saved.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setShipping(String(settings?.shipping ?? 0));
    setDirty(false);
    setError('');
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your store configuration
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <Truck size={16} className="text-brand-500" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              Shipping & Delivery
            </span>
          </div>
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Card body */}
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw size={22} className="text-brand-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Shipping fee field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shipping Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 dark:text-gray-500 select-none">
                    MAD
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shipping}
                    onChange={e => handleChange(e.target.value)}
                    className={`w-full pl-14 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium outline-none transition-colors
                      ${error
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500'
                        : 'border-gray-200 dark:border-gray-700 focus:border-brand-400 dark:focus:border-brand-500'
                      }`}
                    placeholder="0.00"
                  />
                </div>

                {/* Hint / Error */}
                {error ? (
                  <p className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle size={11} />
                    {error}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <Info size={11} />
                    Applied to every order at checkout. Set to 0 for free shipping.
                  </p>
                )}
              </div>

              {/* Last updated */}
              {settings?.updated_at && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Last updated:{' '}
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    {new Date(settings.updated_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Card footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-end gap-3">
          {dirty && (
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading || !dirty || !!error}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {saving
              ? <RefreshCw size={14} className="animate-spin" />
              : <Save size={14} />
            }
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}