import ProtectedRoute from '@/components/shared/ProtectedRoute';
import UserNavbar from '@/components/user/UserNavbar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <UserNavbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}