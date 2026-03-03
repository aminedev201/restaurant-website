'use client';

import { useState } from 'react';
import { User, Mail, Phone, Camera, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

export default function ProfileClient() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullname: user?.fullname ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl ">
      <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center text-white text-2xl font-bold font-display">
            {user?.fullname ? getInitials(user.fullname) : 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Camera size={13} className="text-gray-500" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.fullname}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="badge bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.fullname} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field pl-9" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field pl-9" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-field pl-9" placeholder="+212 600 000 000" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="submit" className="btn-primary">
              <Save size={15} />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
            {saved && <p className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Profile updated</p>}
          </div>
        </form>
      </div>
    </div>
  );
}