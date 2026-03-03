import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminFooter from '@/components/admin/AdminFooter';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950"> {/* h-screen بدل min-h-screen */}
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AdminNavbar title="Dashboard" />
          <main className="flex-1 overflow-y-auto"> {/* overflow-y-auto بدل overflow-auto */}
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}