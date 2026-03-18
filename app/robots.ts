import { MetadataRoute } from 'next';
import { normalizeConfiguredBaseUrl } from '@/lib/publicUrls';

function getBaseUrl(): string {
  return normalizeConfiguredBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://communvivant.fr');
}

function isPublicProduction(): boolean {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === 'production';
  }

  return getBaseUrl() === 'https://communvivant.fr';
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  if (!isPublicProduction()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin', '/auth/', '/dashboard', '/dashboard-pro', '/espace', '/espace-pro', '/invite/', '/pro'],
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
