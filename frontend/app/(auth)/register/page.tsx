import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create an account to book tables and manage orders.',
};

export default function RegisterPage() {
  return <RegisterClient />;
}