import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function HomeContact() {
  return (
    <section className="relative bg-white dark:bg-gray-900 py-20 md:py-28 overflow-hidden">
      {/* Background texture — matches HomeCategories */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="h-px w-8 bg-amber-500/60" />
              <span className="text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-[0.2em]">
                Get in Touch
              </span>
              <div className="h-px w-8 bg-amber-500/60" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              We'd Love to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-300 dark:to-amber-500">
                Hear From You
              </span>
            </h2>
          </div>
          <Link
            href="/contact"
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors shrink-0 group/link"
          >
            Contact us
            <ArrowRight size={15} className="group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: Mail,
              title: 'Email Us',
              desc: "Send us a message anytime and we'll get back to you within 24 hours.",
              href: '/contact',
              cta: 'Send a message',
            },
            {
              icon: Phone,
              title: 'Call Us',
              desc: "Prefer to talk? Give us a call during working hours and we'll be happy to help.",
              href: '/contact',
              cta: 'Find our number',
            },
            {
              icon: MapPin,
              title: 'Visit Us',
              desc: "Come see us in person. We're located in the heart of Rabat, easy to find.",
              href: '/contact',
              cta: 'Get directions',
            },
          ].map(({ icon: Icon, title, desc, href, cta }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:gap-2.5 transition-all">
                {cta}
                <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}