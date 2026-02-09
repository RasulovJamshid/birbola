import type { Metadata } from 'next'
import KindergartenDetail from '@/src/components/KindergartenDetail'

export const metadata: Metadata = {
  title: "Bog'cha tafsilotlari | Birbola",
  description:
    "Tanlangan bolalar bog'chasi haqida batafsil ma'lumotlar: manzil, qulayliklar, ta'lim tili va ota-onalar sharhlari.",
}

interface KindergartenPageProps {
  params: {
    id: string
  }
}

export default function KindergartenPage({ params }: KindergartenPageProps) {
  const id = parseInt(params.id, 10)
  return <KindergartenDetail id={id} />
}
