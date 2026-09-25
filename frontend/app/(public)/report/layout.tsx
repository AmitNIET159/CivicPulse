import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report an Issue | CivicPulse',
  description: 'Report a local civic issue such as a pothole, broken streetlight, or garbage dump directly to municipal officials.',
  openGraph: {
    title: 'Report an Issue | CivicPulse',
    description: 'Report a local civic issue such as a pothole, broken streetlight, or garbage dump directly to municipal officials.',
    url: '/report',
  }
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
