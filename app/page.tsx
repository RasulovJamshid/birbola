'use client'

import Header from '@/src/components/Header'
import Hero from '@/src/components/Hero'
import TopBogchalar from '@/src/components/TopBogchalar'
import AboutSite from '@/src/components/AboutSite'
import Partners from '@/src/components/Partners'
import Community from '@/src/components/Community'
import WhyChooseUs from '@/src/components/WhyChooseUs'
import Footer from '@/src/components/Footer'

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#090318]">
      <Header enableSticky={true} isTransparentInitially={true} />
      <main aria-label="Bosh sahifa" className="relative flex min-h-0 flex-1 flex-col">
        <Hero />
        <div className="relative z-10 flex flex-1 flex-col">
          <AboutSite />
          <TopBogchalar />
          <Partners />
          <Community />
          <WhyChooseUs />
        </div>
      </main>
      <Footer />
    </div>
  )
}
