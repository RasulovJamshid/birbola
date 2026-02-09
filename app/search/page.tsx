import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchResults from '@/src/components/SearchResults'

export const metadata: Metadata = {
  title: "Bog'chalarni qidirish | Birbola",
  description:
    "O'z hududingizdagi bolalar bog'chalarini qulay filtrlash va qidirish orqali toping. Reyting, narx va qulayliklarga qarab saralash.",
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] flex items-center justify-center">
          <div className="text-white text-xl">Yuklanmoqda...</div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
