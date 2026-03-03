import type { Metadata } from 'next';
import ForgotClient from './ForgotClient';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your account password.',
};

export default function ForgotPasswordPage() {
  return <ForgotClient />;
}