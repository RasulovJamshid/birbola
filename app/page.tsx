'use client'

import Header from '@/src/components/Header'
import Hero from '@/src/components/Hero'
import TopBogchalar from '@/src/components/TopBogchalar'
import Partners from '@/src/components/Partners'
import Community from '@/src/components/Community'
import WhyChooseUs from '@/src/components/WhyChooseUs'
import Footer from '@/src/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#200D37]">
      <Header enableSticky={true} />
      <Hero />
      <TopBogchalar />
      <Partners />
      <Community />
      <WhyChooseUs />
      <Footer />
    </div>
  )
}
