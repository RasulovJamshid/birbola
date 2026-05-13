import type { Metadata } from 'next'
import KindergartenDetail from '@/src/components/KindergartenDetail'
import { getKindergartenById } from '@/src/services/api'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const kg = await getKindergartenById(Number(id))
    const districtName = kg.districtName || kg.district?.districtName || 'Toshkent'
    const description = kg.description
      || `${kg.name} — ${districtName}da joylashgan bog'cha. Birbola platformasida batafsil ma'lumot.`

    return {
      title: kg.name,
      description,
      openGraph: {
        title: `${kg.name} | Birbola`,
        description,
        images: kg.profilePhoto ? [{ url: kg.profilePhoto }] : [],
        url: `https://birbola.uz/kindergarten/${id}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${kg.name} | Birbola`,
        description,
        images: kg.profilePhoto ? [kg.profilePhoto] : [],
      },
    }
  } catch {
    return { title: "Bog'cha" }
  }
}

export default async function KindergartenPage({ params }: Props) {
  const { id } = await params
  return <KindergartenDetail id={parseInt(id, 10)} />
}
