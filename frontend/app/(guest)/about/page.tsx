import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'The story behind La Maison Restaurant — passion, tradition, and modern cuisine.',
};

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gray-950 text-white py-20 text-center">
        <p className="text-brand-400 uppercase tracking-widest text-sm mb-2">Our Story</p>
        <h1 className="font-display text-5xl font-bold">About La Maison</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-5">
              Born from a Passion for Flavor
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              La Maison was founded in 2010 by Chef Karim Alaoui, who trained in Paris and returned to Rabat with a vision: to honour Morocco&apos;s magnificent culinary heritage through the lens of contemporary technique.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Every dish on our menu is a bridge between generations — the warmth of a grandmother&apos;s kitchen meeting the precision of a Michelin-trained brigade.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden h-80 bg-gray-100 dark:bg-gray-800">
            <div className="w-full h-full flex items-center justify-center text-6xl">👨‍🍳</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['14+', 'Years of Excellence'], ['3', 'Chef Awards'], ['40+', 'Menu Items'], ['5000+', 'Happy Guests / Month']].map(([n, l]) => (
            <div key={l} className="bg-brand-50 dark:bg-gray-900 rounded-2xl p-6">
              <p className="font-display text-4xl font-bold text-brand-600 dark:text-brand-400">{n}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}