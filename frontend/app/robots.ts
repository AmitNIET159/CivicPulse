import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://civic-pulse-xi.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/issues',
        '/issues/*',
      ],
      disallow: [
        '/login',
        '/dashboard',
        '/dashboard/*',
        '/admin',
        '/admin/*',
        '/profile',
        '/api/*', // Next.js API routes if any
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

