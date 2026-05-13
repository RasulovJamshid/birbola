'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Sparkles, UsersRound } from 'lucide-react'

const highlights = [
  {
    icon: Search,
    title: 'Qidiruv va filtrlar',
    text: "Hudud, narx va dastur bo'yicha bog'chalarni tezda toping.",
  },
  {
    icon: Sparkles,
    title: 'Sharhlar va tafsilotlar',
    text: "Ota-onalar fikrlari va bog'cha haqidagi muhim ma'lumotlar bir joyda.",
  },
  {
    icon: UsersRound,
    title: '7 mahalla hamjamiyati',
    text: 'Tajriba almashing, savollaringizga javob toping.',
  },
]

const AboutSite = () => {
  const titleRef = useRef(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [])

  return (
    <section
      id="platforma-haqida"
      className="relative overflow-hidden border-t border-white/5 bg-[#090318] py-16 md:py-24"
      aria-labelledby="about-site-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(168, 85, 247, 0.14) 0%, transparent 58%)',
        }}
      />

      <div className="site-container relative z-10">
        <div ref={titleRef} className="reveal-on-scroll mx-auto max-w-3xl text-center">
          <span className="mb-3 block text-sm font-bold uppercase tracking-widest text-[#d946ef]">
            Platforma haqida
          </span>
          <h2 id="about-site-heading" className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Birbola nima uchun kerak?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
            <span className="font-semibold text-white/85">Birbola</span> — bolangiz uchun mos bog&apos;chani
            tanlash, haqiqiy sharhlar bilan tanishish va ota-onalar bilan fikr almashish uchun yagona
            platforma. Ma&apos;lumotlarni bir joyda ko&apos;rib, vaqt tejang.
          </p>
          <div className="mx-auto mt-6 h-1.5 w-20 rounded-full bg-gradient-to-r from-[#d946ef] to-transparent opacity-90" />
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="relative overflow-hidden rounded-[22px] border border-white/[0.08] border-t-white/[0.12] bg-gradient-to-b from-white/[0.06] to-transparent p-5 shadow-[0_16px_48px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#d946ef]/[0.07] via-transparent to-[#818cf8]/[0.05]"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#d946ef]">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/55">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-[#d946ef]/45 hover:bg-[#d946ef]/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500/70"
          >
            Batafsil ma&apos;lumot
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#a855f7] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-4px_rgba(217,70,239,0.45)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-400/80"
          >
            Bog&apos;chalarni ko&apos;rish
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AboutSite
