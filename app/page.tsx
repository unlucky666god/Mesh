// app/page.tsx
import { Metadata } from 'next';
import FeedPage from './feed/FeedPage';

export const metadata: Metadata = {
  title: 'Mesh | Feed',
  description: 'Your personalized digital grid feed',
  openGraph: {
    title: 'Mesh | Feed',
    description: 'Connect to the digital grid',
    type: 'website',
  },
};

export default function HomePage() {
  return <FeedPage />;
}