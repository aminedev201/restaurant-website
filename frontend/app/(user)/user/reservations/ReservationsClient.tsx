'use client';

import Link from 'next/link';
import { CalendarCheck, Plus, Users, Clock } from 'lucide-react';

const reservations = [
  { id: 1, date: 'March 5, 2026', time: '20:00', guests: 2, status: 'confirmed', table: 4 },
  { id: 2, date: 'February 14, 2026', time: '19:30', guests: 4, status: 'completed', table: 7 },
  { id: 3, date: 'January 22, 2026', time: '13:00', guests: 2, status: 'completed', table: 2 },
  { id: 4, date: 'January 1, 2026', time: '20:30', guests: 6, status: 'cancelled', table: 10 },
];

const statusStyle = (s: string) => ({
  confirmed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
}[s] ?? '');

export default function ReservationsClient() {
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Reservations</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{reservations.length} total reservations</p>
        </div>
        <Link href="/booking" className="btn-primary">
          <Plus size={16} /> New Reservation
        </Link>
      </div>

      <div className="space-y-4">
        {reservations.map(r => (
          <div key={r.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center shrink-0">
              <CalendarCheck size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{r.date}</h3>
                <span className={`badge capitalize ${statusStyle(r.status)}`}>{r.status}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Clock size={13} /> {r.time}</span>
                <span className="flex items-center gap-1"><Users size={13} /> {r.guests} guests</span>
                <span>Table #{r.table}</span>
              </div>
            </div>
            {r.status === 'confirmed' && (
              <button className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}