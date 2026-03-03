import Link from 'next/link';
import { ChefHat, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center">
                <ChefHat size={18} className="text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-white">La Maison</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              An intimate dining experience where tradition meets modern gastronomy. Every dish tells a story.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-brand-500 rounded-full flex items-center justify-center transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-display tracking-wide">Explore</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/menu', 'Our Menu'], ['/booking', 'Reserve a Table'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-400 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-display tracking-wide">Opening Hours</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex justify-between"><span>Mon – Thu</span><span className="text-gray-300">12pm – 10pm</span></li>
              <li className="flex justify-between"><span>Fri – Sat</span><span className="text-brand-400 font-medium">12pm – 11:30pm</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="text-gray-300">1pm – 9pm</span></li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">Kitchen closes 30 min before closing</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 font-display tracking-wide">Contact</h4>
            <ul className="space-y-3">
              {[
                [MapPin, '14 Rue Hassan II, Rabat 10000'],
                [Phone, '+212 537 000 000'],
                [Mail, 'hello@lamaison.ma'],
              ].map(([Icon, text], i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                  <Icon size={15} className="text-brand-400 mt-0.5 shrink-0" />
                  <span>{text as string}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} La Maison Restaurant. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}