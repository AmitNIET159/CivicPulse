import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'CivicPulse — Report. Vote. Resolve.',
  description: 'Hyperlocal civic issue reporting platform. Report potholes, broken streetlights, garbage, and more. Vote to prioritize. Officials resolve.',
  keywords: ['civic', 'issue', 'reporting', 'pothole', 'streetlight', 'municipal', 'government'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#F9FAFB',
              border: '1px solid #1F2937',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#111827' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#111827' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
