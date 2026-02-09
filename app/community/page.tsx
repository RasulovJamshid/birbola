import type { Metadata } from 'next'
import CommunityFeed from '@/src/components/CommunityFeed'

export const metadata: Metadata = {
  title: '7 mahalla – Ota-onalar jamiyati | Birbola',
  description:
    "Ota-onalar tajriba almashadigan 7 mahalla jamiyati. Sharhlar, savollar va farzand tarbiyasi bo'yicha fikrlar almashinuvi.",
}

export default function CommunityPage() {
  return <CommunityFeed />
}
