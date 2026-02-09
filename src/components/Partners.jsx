'use client'

import React, { useRef, useEffect, useState } from 'react'

const PartnerLogo = ({ name, icon }) => (
  <div className="flex-shrink-0 w-[240px] h-[140px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center p-8 group hover:border-white/30 hover:bg-white/10 transition-all duration-500">
    <img
      src={icon}
      alt={name}
      className="max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-110"
      draggable="false"
    />
  </div>
)

const ScrollablePartnerRow = ({ items, direction = 'left', speed = 0.5 }) => {
  const scrollRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  
  const extendedItems = [...items, ...items, ...items, ...items]

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let animationId
    const step = () => {
      if (!isPaused && container) {
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
  }, [isPaused, direction, speed])

  return (
    <div className="relative group/row">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#200D37] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#200D37] to-transparent z-10 pointer-events-none" />
      
      <div
        ref={scrollRef}
        className="flex gap-10 overflow-x-auto py-8 no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing select-none"
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
  const [scrollY, setScrollY] = useState(0)
  const sectionRef = useRef(null)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setScrollY(window.scrollY)
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Generate particle positions only on the client to avoid SSR hydration mismatch
    const generated = Array.from({ length: 6 }, (_, i) => ({
      top: Math.random() * 200,
      left: 15 + Math.random() * 70,
      index: i
    }))
    setParticles(generated)
  }, [])

  const arcScale = 1 + Math.min(Math.max((scrollY - (sectionRef.current?.offsetTop || 0)) * 0.0004, -0.15), 0.15)
  const arcOpacity = 0.6 + Math.min(Math.max((scrollY - (sectionRef.current?.offsetTop || 0)) * 0.0008, -0.2), 0.4)

  const partners = [
    { id: 1, name: "Cambridge", icon: "/cambridge.png" },
    { id: 2, name: "President School", icon: "/president-school.png" },
    { id: 3, name: "Vosiq", icon: "/vosiq.png" },
    { id: 4, name: "Merit", icon: "/merit.png" },
    { id: 5, name: "Sehriyo", icon: "/sehriyo.png" },
  ]

  return (
    <section ref={sectionRef} className="pt-48 pb-32 relative overflow-hidden bg-[#200D37]">
      {/* 
        ==================================================
        WOW EFFECT ARC SYSTEM
        ==================================================
      */}
      
      {/* 1. Base Layer: Deep Glow */}
      <div 
        className="pink-rising-arc !top-0 !h-[450px] opacity-40 blur-[100px]"
        style={{ transform: `translateX(-50%) scaleX(${arcScale * 1.2})` }}
      />

      {/* 2. Main Visual Arc: Vibrant Gradient */}
      <div 
        className="pink-rising-arc !top-0 !h-[380px] transition-all duration-500 ease-out z-0"
        style={{ 
          transform: `translateX(-50%) scaleX(${arcScale})`,
          opacity: arcOpacity,
          background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(255, 7, 222, 0.7) 0%, rgba(186, 0, 255, 0.4) 40%, rgba(32, 13, 55, 0) 100%)'
        }}
      />

      {/* 3. "Energy" Secondary Layer: Shimmering Highlight */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[180%] h-[300px] pointer-events-none opacity-30 z-1"
        style={{ 
          borderRadius: '50% 50% 0 0',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
          filter: 'blur(40px)',
          transform: `translateX(-50%) scaleX(${arcScale * 0.8}) translateY(${Math.sin(scrollY * 0.005) * 20}px)`,
        }}
      />

      {/* 4. Floating Energy Particles */}
      {particles.map((particle) => (
        <div
          key={particle.index}
          className="absolute w-1 h-1 bg-pink-400 rounded-full blur-[1px] animate-pulse pointer-events-none"
          style={{
            top: `${particle.top}px`,
            left: `${particle.left}%`,
            opacity: 0.4,
            animationDuration: `${2 + particle.index}s`,
            animationDelay: `${particle.index * 0.5}s`,
            transform: `translateY(${Math.sin((scrollY * 0.002) + particle.index) * 30}px)`
          }}
        />
      ))}

      {/* 
        ==================================================
        CONTENT AREA
        ==================================================
      */}
      
      <div className="relative z-10">
        <div className="container mx-auto px-8 mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
            Bizning hamkorlar
          </h2>
          <div className="w-24 h-1 bg-pink-500 mt-4 rounded-full opacity-60" />
        </div>

        <div className="flex flex-col gap-8 w-full">
          <ScrollablePartnerRow items={partners} direction="left" speed={0.8} />
          <ScrollablePartnerRow items={[...partners].reverse()} direction="right" speed={0.8} />
        </div>
      </div>
    </section>
  )
}

export default Partners