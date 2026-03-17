// app/messenger/page.tsx
import { Metadata } from 'next';
import MessengerPage from '@/components/messenger/MessengerPage';

export const metadata: Metadata = {
  title: 'Messenger | MESH',
  description: 'Secure encrypted messaging',
};

export default function Messenger() {
  return <MessengerPage />;
}