import type { Metadata } from 'next';
import ResetClient from './ResetClient';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account.',
};

export default function ResetPasswordPage() {
  return <ResetClient />;
}