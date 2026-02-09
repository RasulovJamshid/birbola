'use client'

import { Suspense } from 'react'
import SearchResults from '@/src/components/SearchResults'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-white text-xl">Yuklanmoqda...</div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
