import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Civic Issues | CivicPulse',
  description: 'Browse, vote, and track local civic issues reported by the community. Stay updated on the progress of local repairs and infrastructure.',
  openGraph: {
    title: 'Browse Civic Issues | CivicPulse',
    description: 'Browse, vote, and track local civic issues reported by the community.',
    url: '/issues',
  }
};

export default function IssuesListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
