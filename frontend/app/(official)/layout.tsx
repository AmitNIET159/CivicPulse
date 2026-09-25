import { Metadata } from 'next';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Official Dashboard | CivicPulse',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfficialLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
