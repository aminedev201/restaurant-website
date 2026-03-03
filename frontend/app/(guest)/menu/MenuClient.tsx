'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MenuItem } from '@/types';

const categories = ['All', 'Starters', 'Mains', 'Seafood', 'Vegetarian', 'Desserts', 'Drinks'];

const menuData: MenuItem[] = [
  { id: 1, name: 'Zaalouk', description: 'Smoked eggplant & tomato salad with charmoula', price: 65, category: 'Starters', available: true, badge: 'Vegan' },
  { id: 2, name: 'Briouats au Fromage', description: 'Crispy phyllo triangles with goat cheese & herbs', price: 75, category: 'Starters', available: true },
  { id: 3, name: 'Harira Soup', description: 'Traditional tomato, lentil & lamb soup', price: 60, category: 'Starters', available: true },
  { id: 4, name: 'Lamb Tagine', description: 'Slow-braised with preserved lemon & olives', price: 210, category: 'Mains', available: true, badge: 'Signature' },
  { id: 5, name: 'Chicken Pastilla', description: 'Sweet & savory pie with almonds and saffron', price: 175, category: 'Mains', available: true },
  { id: 6, name: 'Mechoui Lamb', description: 'Whole roasted lamb, cumin salt', price: 250, category: 'Mains', available: true },
  { id: 7, name: 'Grilled Sea Bass', description: 'Pan-seared with lemon-caper butter', price: 185, category: 'Seafood', available: true, badge: 'Chef Pick' },
  { id: 8, name: 'Chermoula Prawns', description: 'Tiger prawns with Moroccan chermoula marinade', price: 195, category: 'Seafood', available: true },
  { id: 9, name: 'Vegetable Couscous', description: 'Seven-vegetable couscous, harissa yogurt', price: 130, category: 'Vegetarian', available: true, badge: 'Vegan' },
  { id: 10, name: 'Stuffed Peppers', description: 'Rice, pine nuts, raisins & spices', price: 110, category: 'Vegetarian', available: true },
  { id: 11, name: 'Bastilla au Lait', description: 'Crispy milk pastry with almonds & orange flower', price: 75, category: 'Desserts', available: true },
  { id: 12, name: 'Crème Caramel', description: 'Classic French with Moroccan vanilla', price: 65, category: 'Desserts', available: true },
  { id: 13, name: 'Mint Tea', description: 'Traditional Moroccan mint tea, served ceremonially', price: 35, category: 'Drinks', available: true },
  { id: 14, name: 'Fresh Juices', description: 'Orange, pomegranate, or avocado', price: 45, category: 'Drinks', available: true },
];

export default function MenuClient() {
  const [active, setActive] = useState('All');
  const { addItem, items, updateQty, removeItem } = useCart();

  const filtered = active === 'All' ? menuData : menuData.filter(i => i.category === active);

  const getQty = (id: number) => items.find(i => i.menuItem.id === id)?.quantity ?? 0;

  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gray-950 text-white py-16 text-center">
        <p className="text-brand-400 uppercase tracking-widest text-sm mb-2">Our Offerings</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold">The Menu</h1>
      </div>

      {/* Category tabs */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-3 min-w-max">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${active === cat ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(item => {
            const qty = getQty(item.id);
            return (
              <div key={item.id} className="card overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="relative h-44 bg-gray-100 dark:bg-gray-800">
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🍽️</div>
                  {item.badge && <span className="absolute top-2 left-2 badge bg-brand-500 text-white">{item.badge}</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                    <span className="text-brand-600 dark:text-brand-400 font-bold text-sm ml-2 shrink-0">
                      MAD {item.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{item.description}</p>

                  {qty === 0 ? (
                    <button onClick={() => addItem(item)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-lg transition-colors font-medium">
                      <ShoppingCart size={14} /> Add to Order
                    </button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button onClick={() => qty === 1 ? removeItem(item.id) : updateQty(item.id, qty - 1)}
                        className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-full flex items-center justify-center transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-gray-900 dark:text-white">{qty}</span>
                      <button onClick={() => updateQty(item.id, qty + 1)}
                        className="w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}