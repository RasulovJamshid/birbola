import { MetadataRoute } from 'next'
import { getKindergartens } from '@/src/services/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://birbola.uz'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  let kindergartenRoutes: MetadataRoute.Sitemap = []
  try {
    const result = await getKindergartens({
      pageSize: 1000,
      pageNumber: 1,
    } as Parameters<typeof getKindergartens>[0])
    const items = result?.data ?? result ?? []
    kindergartenRoutes = items.map((kg: { id: number }) => ({
      url: `${baseUrl}/kindergarten/${kg.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // silently skip if API is unreachable during build
  }

  return [...staticRoutes, ...kindergartenRoutes]
}
