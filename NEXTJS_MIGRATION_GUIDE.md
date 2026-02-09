# Next.js Migration Guide for Birbola

## Overview
This guide covers migrating the Birbola website from React + Vite to Next.js 14 (App Router) for improved SEO, server-side rendering, and performance.

## Why Next.js?

### Benefits:
- ✅ **Better SEO** - Server-side rendering (SSR) and static generation (SSG)
- ✅ **Improved Performance** - Automatic code splitting, image optimization
- ✅ **Built-in Routing** - File-based routing system
- ✅ **API Routes** - Backend API endpoints in the same project
- ✅ **Metadata Management** - Easy SEO meta tags per page
- ✅ **Streaming & Suspense** - Better loading states
- ✅ **Edge Runtime** - Deploy to edge for faster response times

## Migration Steps

### Phase 1: Setup Next.js Project

1. **Install Next.js dependencies:**
```bash
npm install next@latest react@latest react-dom@latest
npm install -D @types/node @types/react @types/react-dom
```

2. **Update package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

3. **Create Next.js configuration:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'api.birbola.uz', 'auth.birbola.uz'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.birbola.uz/api/v1/:path*',
      },
      {
        source: '/auth/:path*',
        destination: 'https://auth.birbola.uz/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

### Phase 2: Project Structure Migration

**Current Structure (Vite):**
```
src/
├── components/
├── services/
├── hooks/
├── assets/
├── App.jsx
├── main.jsx
└── index.css
```

**New Structure (Next.js App Router):**
```
app/
├── (routes)/
│   ├── page.tsx                    # Home page (/)
│   ├── layout.tsx                  # Root layout
│   ├── search/
│   │   └── page.tsx               # Search page (/search)
│   ├── kindergarten/
│   │   └── [id]/
│   │       └── page.tsx           # Detail page (/kindergarten/[id])
│   ├── signin/
│   │   └── page.tsx               # Sign in (/signin)
│   └── signup/
│       └── page.tsx               # Sign up (/signup)
├── api/                           # API routes (optional)
├── components/                    # Shared components
├── lib/                          # Utilities, API clients
│   ├── api.ts                    # API functions
│   └── utils.ts                  # Helper functions
├── hooks/                        # Custom hooks
├── styles/
│   └── globals.css              # Global styles
└── public/                       # Static assets
    └── assets/
```

### Phase 3: Component Migration

#### 1. **Root Layout** (`app/layout.tsx`)
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Birbola - Bog\'chalar platformasi',
  description: 'Farzandingiz uchun eng yaxshi bog\'chani toping',
  keywords: ['bog\'cha', 'maktabgacha ta\'lim', 'bolalar bog\'chasi', 'Toshkent'],
  openGraph: {
    title: 'Birbola - Bog\'chalar platformasi',
    description: 'Farzandingiz uchun eng yaxshi bog\'chani toping',
    url: 'https://birbola.uz',
    siteName: 'Birbola',
    locale: 'uz_UZ',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

#### 2. **Home Page** (`app/page.tsx`)
```typescript
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TopBogchalar from '@/components/TopBogchalar'
import Partners from '@/components/Partners'
import Community from '@/components/Community'
import WhyChooseUs from '@/components/WhyChooseUs'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#200D37]">
      <Header />
      <Hero />
      <TopBogchalar />
      <Partners />
      <Community />
      <WhyChooseUs />
      <Footer />
    </div>
  )
}
```

#### 3. **Search Page with SSR** (`app/search/page.tsx`)
```typescript
import { Suspense } from 'react'
import SearchResults from '@/components/SearchResults'
import { getKindergartens } from '@/lib/api'

export const metadata = {
  title: 'Bog\'chalarni izlash - Birbola',
  description: 'Toshkent shahrida bog\'chalarni izlang va solishtiring',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  // Server-side data fetching for initial results
  const initialData = await getKindergartens({
    search: searchParams.q || '',
    pageSize: 9,
    pageNumber: 1,
  })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults initialData={initialData} />
    </Suspense>
  )
}
```

#### 4. **Kindergarten Detail Page with SSG** (`app/kindergarten/[id]/page.tsx`)
```typescript
import { notFound } from 'next/navigation'
import { getKindergartenById, getKindergartens } from '@/lib/api'
import KindergartenDetail from '@/components/KindergartenDetail'

export async function generateStaticParams() {
  // Generate static pages for all kindergartens
  const kindergartens = await getKindergartens({ pageSize: 100 })
  
  return kindergartens.map((kg) => ({
    id: kg.id.toString(),
  }))
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const kindergarten = await getKindergartenById(parseInt(params.id))
  
  if (!kindergarten) {
    return {
      title: 'Bog\'cha topilmadi - Birbola',
    }
  }

  return {
    title: `${kindergarten.name} - Birbola`,
    description: `${kindergarten.name} - ${kindergarten.location}`,
    openGraph: {
      title: kindergarten.name,
      description: kindergarten.location,
      images: [kindergarten.profilePhoto],
    },
  }
}

export default async function KindergartenPage({
  params,
}: {
  params: { id: string }
}) {
  const kindergarten = await getKindergartenById(parseInt(params.id))

  if (!kindergarten) {
    notFound()
  }

  return <KindergartenDetail kindergarten={kindergarten} />
}
```

### Phase 4: API Client Migration

**Convert to Next.js API client** (`lib/api.ts`):
```typescript
// Use Next.js fetch with caching and revalidation
export async function getKindergartens(params = {}) {
  const queryParams = new URLSearchParams()
  // ... build query params

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/Kindergarten/GetAll?${queryParams}`,
    {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch kindergartens')
  }

  return res.json()
}

export async function getKindergartenById(id: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/Kindergarten/GetById/${id}`,
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  )

  if (!res.ok) {
    return null
  }

  return res.json()
}
```

### Phase 5: Client Components

**Mark interactive components as 'use client':**

```typescript
// components/Hero.tsx
'use client'

import { useState, useEffect } from 'react'
// ... rest of component
```

**Components that need 'use client':**
- Hero (has search state)
- TopBogchalar (has carousel state)
- SearchResults (has filter state)
- SignIn/SignUp (has form state)
- Any component using hooks (useState, useEffect, etc.)

### Phase 6: Environment Variables

**Create `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.birbola.uz/api/v1
NEXT_PUBLIC_AUTH_URL=https://auth.birbola.uz/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id
NEXT_PUBLIC_TELEGRAM_BOT_ID=your_telegram_bot_id
```

### Phase 7: Styling Migration

**TailwindCSS configuration** (`tailwind.config.ts`):
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Your custom theme
    },
  },
  plugins: [],
}
export default config
```

**Global styles** (`app/globals.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Copy all your custom CSS from index.css */
```

### Phase 8: Image Optimization

**Replace `<img>` with Next.js `<Image>`:**

```typescript
import Image from 'next/image'

// Before
<img src={Logo} alt="Birbola" className="h-10" />

// After
<Image 
  src={Logo} 
  alt="Birbola" 
  width={40} 
  height={40}
  className="h-10"
/>
```

### Phase 9: Routing Migration

**Replace React Router with Next.js navigation:**

```typescript
// Before (React Router)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/search')

// After (Next.js)
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/search')

// For links
import Link from 'next/link'
<Link href="/search">Search</Link>
```

### Phase 10: Deployment

**Vercel (Recommended):**
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

**Self-hosted with Docker:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## SEO Improvements

### 1. **Dynamic Meta Tags**
Each page can have custom meta tags for better SEO:
```typescript
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['/og-image.jpg'],
  },
}
```

### 2. **Structured Data**
Add JSON-LD for rich snippets:
```typescript
export default function KindergartenPage({ kindergarten }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: kindergarten.name,
    address: kindergarten.location,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: kindergarten.score,
      ratingCount: kindergarten.reviewCount,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  )
}
```

### 3. **Sitemap Generation**
```typescript
// app/sitemap.ts
import { getKindergartens } from '@/lib/api'

export default async function sitemap() {
  const kindergartens = await getKindergartens({ pageSize: 1000 })

  const kindergartenUrls = kindergartens.map((kg) => ({
    url: `https://birbola.uz/kindergarten/${kg.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://birbola.uz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://birbola.uz/search',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...kindergartenUrls,
  ]
}
```

### 4. **Robots.txt**
```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://birbola.uz/sitemap.xml',
  }
}
```

## Performance Optimizations

1. **Image Optimization** - Automatic with Next.js Image component
2. **Code Splitting** - Automatic per route
3. **Lazy Loading** - Use `dynamic()` for heavy components
4. **Caching** - Configure fetch caching and revalidation
5. **Edge Runtime** - Deploy API routes to edge for faster response

## Testing Strategy

1. **Test each page individually**
2. **Verify SEO meta tags** - Use Chrome DevTools
3. **Check Core Web Vitals** - Use Lighthouse
4. **Test dynamic routes** - Ensure all kindergarten pages work
5. **Verify API integration** - Test all data fetching

## Rollback Plan

Keep the Vite version in a separate branch until Next.js version is fully tested and deployed.

## Timeline Estimate

- **Phase 1-2 (Setup & Structure):** 2-3 hours
- **Phase 3-5 (Component Migration):** 8-10 hours
- **Phase 6-8 (Config & Optimization):** 3-4 hours
- **Phase 9-10 (Routing & Deployment):** 2-3 hours
- **Testing & Refinement:** 4-5 hours

**Total:** ~20-25 hours of development time

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
