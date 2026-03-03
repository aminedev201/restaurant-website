import type { Metadata } from 'next';
import UserDashboardClient from './UserDashboardClient';

export const metadata: Metadata = { title: 'My Dashboard' };

export default function UserDashboardPage() {
  return <UserDashboardClient />;
}