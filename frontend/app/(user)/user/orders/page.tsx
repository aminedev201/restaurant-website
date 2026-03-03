import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Orders' };

const orders = [
  { id: 'ORD-001', date: 'Feb 26, 2026', items: ['Lamb Tagine', 'Harira Soup', 'Mint Tea'], total: 305, status: 'delivered' },
  { id: 'ORD-002', date: 'Jan 22, 2026', items: ['Sea Bass', 'Zaalouk'], total: 250, status: 'delivered' },
];

const statusStyle = (s: string) => ({
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  preparing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}[s] ?? '');

export default function OrdersPage() {
  return (
    <div className="">
      <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{o.id}</p>
                  <p className="text-sm text-gray-400">{o.date}</p>
                </div>
                <span className={`badge capitalize ${statusStyle(o.status)}`}>{o.status}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {o.items.join(' · ')}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">{o.items.length} items</span>
                <span className="font-bold text-gray-900 dark:text-white">MAD {o.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}