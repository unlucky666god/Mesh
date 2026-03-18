// app/messenger/page.tsx
import { Metadata } from 'next';
import MessengerPage from '@/components/messenger/MessengerPage';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Messenger | MESH',
  description: 'Secure encrypted messaging',
};

export default function Messenger() {
  return (
    <Suspense fallback={<div>Loading Messenger...</div>}>
      <MessengerPage />
    </Suspense>
  );
}