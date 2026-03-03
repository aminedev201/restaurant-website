import { Star, Quote } from 'lucide-react';

const reviews = [
  { name: 'Sofia Benali', role: 'Food Blogger', text: 'An absolutely transcendent dining experience. The lamb tagine is worth the trip from Casablanca alone.', stars: 5 },
  { name: 'James Harrington', role: 'Travel Writer', text: 'La Maison understands what fine dining should feel like — warm, personal, and utterly delicious.', stars: 5 },
  { name: 'Fatima Ait Said', role: 'Regular Guest', text: 'We celebrate every anniversary here. The staff remembers us by name. That says everything.', stars: 5 },
];

export default function HomeTestimonials() {
  return (
    <section className="py-20 bg-brand-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-500 font-medium uppercase tracking-widest text-sm mb-2">Guest Stories</p>
          <h2 className="section-title">What People Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map(r => (
            <div key={r.name} className="card p-7 relative">
              <Quote size={32} className="text-brand-200 dark:text-brand-900 absolute top-5 right-5" />
              <div className="flex gap-1 mb-4">
                {[...Array(r.stars)].map((_, i) => <Star key={i} size={14} className="fill-brand-400 text-brand-400" />)}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.name}</p>
                <p className="text-gray-400 text-xs">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}