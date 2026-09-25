import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://civic-pulse-xi.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Base public routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/issues`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ];

  // Fetch recent public issues for dynamic sitemap inclusion
  try {
    const res = await fetch(`${apiUrl}/issues?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data.issues && Array.isArray(data.issues)) {
        const issueRoutes: MetadataRoute.Sitemap = data.issues.map((issue: any) => ({
          url: `${baseUrl}/issues/${issue._id}`,
          lastModified: new Date(issue.updatedAt),
          changeFrequency: 'daily',
          priority: 0.7,
        }));
        routes.push(...issueRoutes);
      }
    }
  } catch (error) {
    console.error('Failed to fetch issues for sitemap:', error);
  }

  return routes;
}

