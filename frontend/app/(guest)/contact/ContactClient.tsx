'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
  };

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gray-950 text-white py-16 text-center">
        <p className="text-brand-400 uppercase tracking-widest text-sm mb-2">Get In Touch</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">Contact Us</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Info */}
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Visit Us</h2>
          <div className="space-y-5">
            {[
              { icon: MapPin, label: 'Address', value: '14 Rue Hassan II, Rabat 10000, Morocco' },
              { icon: Phone, label: 'Phone', value: '+212 537 000 000' },
              { icon: Mail, label: 'Email', value: 'hello@lamaison.ma' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-2xl h-48 flex items-center justify-center text-gray-400">
            <MapPin size={32} />
            <span className="ml-2 text-sm">Map placeholder</span>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          {sent ? (
            <div className="text-center py-8">
              <Send size={40} className="text-brand-500 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Send a Message</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                  <input required className="input-field" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <input required type="email" className="input-field" placeholder="you@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subject</label>
                <input required className="input-field" placeholder="How can we help?" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Message</label>
                <textarea required rows={5} className="input-field resize-none" placeholder="Your message..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary w-full">
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}