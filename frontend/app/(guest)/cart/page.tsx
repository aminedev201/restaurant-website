import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'Your Order',
  description: '',
};
export default function CartPage() {
  return <CartClient />;
}