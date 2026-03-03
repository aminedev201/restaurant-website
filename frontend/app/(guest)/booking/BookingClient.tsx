'use client';

import { useState } from 'react';
import { CalendarCheck, Users, Clock, CheckCircle2 } from 'lucide-react';

const timeSlots = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

export default function BookingClient() {
  const [form, setForm] = useState({ date: '', time: '', guests: '2', name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="pt-20 min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Reservation Requested!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thank you, <strong>{form.name}</strong>. We&apos;ll confirm your table for <strong>{form.guests} guests</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong>.
        </p>
        <p className="text-sm text-gray-400 mb-6">A confirmation will be sent to {form.email}</p>
        <button onClick={() => setSubmitted(false)} className="btn-secondary w-full">Make Another Reservation</button>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gray-950 text-white py-16 text-center">
        <p className="text-brand-400 uppercase tracking-widest text-sm mb-2">Join Us</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">Reserve a Table</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: CalendarCheck, text: 'Instant Confirmation' },
            { icon: Users, text: 'Up to 40 Guests' },
            { icon: Clock, text: 'Flexible Times' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="card p-4 text-center">
              <Icon size={20} className="text-brand-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">Your Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-field" placeholder="+212 600 000 000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-field" placeholder="your@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input required type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guests</label>
              <select value={form.guests} onChange={e => setForm(p => ({ ...p, guests: e.target.value }))} className="input-field">
                {[1,2,3,4,5,6,7,8,10,12,15,20].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Time</label>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, time: t }))}
                  className={`py-2 text-sm rounded-lg border font-medium transition-all
                    ${form.time === t ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Requests (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3} className="input-field resize-none" placeholder="Allergies, celebrations, seating preferences..." />
          </div>

          <button type="submit" disabled={loading || !form.time || !form.date}
            className="btn-primary w-full py-4 text-base disabled:opacity-50">
            {loading ? 'Submitting...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}