'use client'

import { useParams } from 'next/navigation'
import KindergartenDetail from '@/src/components/KindergartenDetail'

export default function KindergartenPage() {
  const params = useParams()
  const id = params.id as string

  return <KindergartenDetail id={parseInt(id)} />
}
