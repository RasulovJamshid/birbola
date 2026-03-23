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
    <div className="flex flex-col bg-[#090318]">
      <Header enableSticky={true} isTransparentInitially={true} />
      <Hero />
      <div className="relative z-10">
        <TopBogchalar />
        <Partners />
        <Community />
        <WhyChooseUs />
      </div>
      <Footer />
    </div>
  )
}
