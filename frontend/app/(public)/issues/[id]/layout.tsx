import { Metadata } from 'next';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

// Next.js uses fetch by default; we need to call our backend API to get the metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Note: since this runs server-side during rendering, it must hit the full URL if absolute is required, 
    // or just the internal NEXT_PUBLIC_API_URL if configured. Since we're just adding SEO, let's assume
    // standard fetch pointing to the backend. We use the public URL or fallback.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    const res = await fetch(`${apiUrl}/issues/${params.id}`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      return {
        title: 'Issue Not Found | CivicPulse',
        robots: { index: false }
      };
    }

    const { issue } = await res.json();
    
    if (!issue) {
      return {
        title: 'Issue Not Found | CivicPulse',
        robots: { index: false }
      };
    }

    const title = `${issue.title} | CivicPulse`;
    const description = issue.description.substring(0, 160) + (issue.description.length > 160 ? '...' : '');
    const imageUrl = issue.photos && issue.photos.length > 0 ? (issue.photos[0].url || issue.photos[0].thumbnail) : undefined;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: issue.createdAt,
        modifiedTime: issue.updatedAt,
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (error) {
    return {
      title: 'Civic Issue | CivicPulse'
    };
  }
}

export default function IssueDetailLayout({ children }: Props) {
  return <>{children}</>;
}
