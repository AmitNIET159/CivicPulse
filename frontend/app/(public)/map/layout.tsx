import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Issue Map | CivicPulse',
  description: 'View a live map of all reported civic issues in your area. See which neighborhoods need the most attention.',
  openGraph: {
    title: 'Issue Map | CivicPulse',
    description: 'View a live map of all reported civic issues in your area.',
    url: '/map',
  }
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
