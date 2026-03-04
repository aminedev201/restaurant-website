import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminFooter from '@/components/admin/AdminFooter';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { CompanyProvider } from '@/context/CompanyContext';
import { Metadata } from 'next';

export const metadata: Metadata= {
  title: { default: 'Restaurant', template: '%s | Admin' },
  description: 'An intimate dining experience where tradition meets modern gastronomy.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <CompanyProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950"> 
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <AdminNavbar title="Dashboard" />
            <main className="flex-1 overflow-y-auto"> 
              {children}
            </main>
            <AdminFooter />
          </div>
        </div>
      </CompanyProvider>
    </ProtectedRoute>
  );
}