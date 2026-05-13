'use client'

import React, { useRef, useEffect, useState } from 'react'

const fadeFromPage = 'from-[#090318]'

const PartnerLogo = ({ name, icon }) => (
  <div className="group relative flex h-[140px] w-[240px] flex-shrink-0 items-center justify-center rounded-[32px] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] border-t-white/[0.15] p-8 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.2] hover:bg-white/[0.08] hover:shadow-[0_10px_40px_rgba(255,255,255,0.05)] overflow-hidden">
    {/* Subtle shimmer effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
    
    <img
      src={icon}
      alt={name}
      className="relative z-10 max-h-full max-w-full object-contain opacity-40 grayscale transition-all duration-500 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0 drop-shadow-md"
      draggable="false"
    />
  </div>
)

const ScrollablePartnerRow = ({ items, direction = 'left', speed = 0.5 }) => {
  const scrollRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const extendedItems = [...items, ...items, ...items, ...items]

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let animationId
    const step = () => {
      if (!isPaused && !reduceMotion && container) {
        const itemWidth = container.scrollWidth / 4

        if (direction === 'left') {
          container.scrollLeft += speed
          if (container.scrollLeft >= itemWidth * 2) {
            container.scrollLeft -= itemWidth
          }
        } else {
          container.scrollLeft -= speed
          if (container.scrollLeft <= itemWidth) {
            container.scrollLeft += itemWidth
          }
        }
      }
      animationId = requestAnimationFrame(step)
    }

    if (container.scrollLeft === 0) {
      container.scrollLeft = (container.scrollWidth / 4) * 1.5
    }

    animationId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationId)
  }, [isPaused, reduceMotion, direction, speed])

  return (
    <div className="relative group/row">
      <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r ${fadeFromPage} to-transparent md:w-32`} />
      <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l ${fadeFromPage} to-transparent md:w-32`} />

      <div
        ref={scrollRef}
        className="flex cursor-grab gap-10 overflow-x-auto py-6 no-scrollbar touch-pan-x select-none active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {extendedItems.map((partner, idx) => (
          <PartnerLogo key={`${partner.id}-${idx}`} {...partner} />
        ))}
      </div>
    </div>
  )
}

const Partners = () => {
  const titleRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1 })

    if (titleRef.current) observer.observe(titleRef.current)
    return () => { if (titleRef.current) observer.unobserve(titleRef.current) }
  }, [])

  const partners = [
    { id: 1, name: 'Cambridge', icon: '/cambridge.png' },
    { id: 2, name: 'President School', icon: '/president-school.png' },
    { id: 3, name: 'Vosiq', icon: '/vosiq.png' },
    { id: 4, name: 'Merit', icon: '/merit.png' },
    { id: 5, name: 'Sehriyo', icon: '/sehriyo.png' },
  ]

  return (
    <section
      id="hamkorlar"
      className="relative overflow-hidden bg-transparent py-20 md:py-28"
      aria-labelledby="hamkorlar-heading"
    >
      <div className="relative z-10">
        <div className="site-container mb-10 md:mb-14">
          <div ref={titleRef} className="reveal-on-scroll max-w-2xl">
            <span className="mb-3 block text-sm font-bold uppercase tracking-widest text-[#d946ef]">
              Ishonchli tarmoq
            </span>
            <h2 id="hamkorlar-heading" className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Bizning hamkorlar
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55 md:text-base">
              Yetakchi ta&apos;lim markazlari va bog&apos;chalar bilan hamkorlikda sifatli tanlov.
            </p>
            <div className="mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#d946ef] to-transparent opacity-80" />
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <ScrollablePartnerRow items={partners} direction="left" speed={0.8} />
          <ScrollablePartnerRow items={[...partners].reverse()} direction="right" speed={0.8} />
        </div>
      </div>
    </section>
  )
}

export default Partners
