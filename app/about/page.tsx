import type { Metadata } from 'next'
import AboutUs from '@/src/components/AboutUs'

export const metadata: Metadata = {
  title: "Biz haqimizda | Birbola",
  description:
    "Birbola haqida batafsil ma'lumot. Ota-onalar va bolalar uchun yaratilgan ishonchli bog'chalar platformasi haqida bilib oling.",
}

export default function AboutPage() {
  return <AboutUs />
}
