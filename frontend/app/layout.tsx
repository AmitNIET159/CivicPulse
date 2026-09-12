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
        <meta name="color-scheme" content="dark" />
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
              background: '#141414',
              color: '#F5F0EB',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#E8943A', secondary: '#141414' } },
            error: { iconTheme: { primary: '#F87171', secondary: '#141414' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
