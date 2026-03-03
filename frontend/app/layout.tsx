import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import { CompanyProvider } from '@/context/CompanyContext';

export const metadata: Metadata = {
  title: { default: 'La Maison Restaurant', template: '%s | La Maison' },
  description: 'An intimate dining experience where tradition meets modern gastronomy.',
  keywords: ['restaurant', 'fine dining', 'reservation', 'Rabat', 'La Maison'],
  openGraph: {
    type: 'website',
    siteName: 'La Maison Restaurant',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <CompanyProvider>
              <CartProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      borderRadius: '14px',
                      fontWeight: '500',
                      fontSize: '14px',
                      padding: '12px 16px',
                    },
                    success: {
                      style: {
                        background: '#10b981',
                        color: '#fff',
                      },
                      iconTheme: { primary: '#fff', secondary: '#10b981' },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                        color: '#fff',
                      },
                      iconTheme: { primary: '#fff', secondary: '#ef4444' },
                    },
                  }}
                />
              </CartProvider>
            </CompanyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}