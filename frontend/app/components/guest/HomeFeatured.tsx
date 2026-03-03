import { Flame, Leaf, Award } from 'lucide-react';

const dishes = [
  { name: 'Grilled Sea Bass', desc: 'Pan-seared with lemon-caper butter, wilted spinach, roasted tomato', price: 'MAD 185', tag: 'Chef\'s Pick', img: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600&q=80' },
  { name: 'Lamb Tagine', desc: 'Slow-braised with preserved lemon, olives & aromatic spices', price: 'MAD 210', tag: 'Signature', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
  { name: 'Vegetarian Couscous', desc: 'Seven vegetable couscous, harissa yogurt', price: 'MAD 130', tag: 'Vegan', img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80' },
];

const features = [
  { icon: Flame, title: 'Wood-fired cooking', desc: 'Traditional argan wood adds irreplaceable depth' },
  { icon: Leaf, title: 'Farm to table', desc: 'Seasonal produce sourced from local Moroccan farms' },
  { icon: Award, title: 'Award-winning', desc: 'Gault & Millau certified since 2019' },
];

export default function HomeFeatured() {
  return (
    <>
      {/* Features strip */}
      <section className="bg-brand-500 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-white/70 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured dishes */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-500 font-medium uppercase tracking-widest text-sm mb-2">Curated Selection</p>
            <h2 className="section-title mb-4">Signature Dishes</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Our chef&apos;s most celebrated creations — each plate a testament to craft and passion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dishes.map(dish => (
              <div key={dish.name} className="group card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative overflow-hidden h-56">
                  <img src={dish.img} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 badge bg-brand-500 text-white">{dish.tag}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">{dish.name}</h3>
                    <span className="text-brand-600 dark:text-brand-400 font-bold text-sm ml-2 shrink-0">{dish.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{dish.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}