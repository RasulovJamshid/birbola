'use client'

import { useEffect, useRef, useState } from 'react'

// Assets now served from public folder
const chatIcon = '/assets/chooseus/chat.svg'
const infosIcon = '/assets/chooseus/infos.svg'
const parentsIcon = '/assets/chooseus/parents.svg'
const handsIcon = '/assets/chooseus/hands.svg'
const logoIcon = '/assets/chooseus/logo.svg'

const features = [
  {
    id: 1,
    title: "Batafsil sharhlar",
    description: "Farzandingiz uchun eng yaxshi sharoitni tanlashda minglab samimiy fikrlardan foydalaning.",
    icon: chatIcon
  },
  {
    id: 2,
    title: "Keng qamrovli ma'lumotlar",
    description: "Narxlar, ta'lim tili, ish grafigi va qo'shimcha to'garaklar haqida barcha tafsilotlar.",
    icon: infosIcon
  },
  {
    id: 3,
    title: "Ota-onalar jamoasi",
    description: "7 mahalla hamjamiyatida tajribali ota-onalar bilan fikr almashing va maslahat oling.",
    icon: parentsIcon
  },
  {
    id: 4,
    title: "Ishonchli hamkorlar",
    description: "Platformamizda faqat sifatli va davlat standartlariga mos keladigan bog'chalar joy olgan.",
    icon: handsIcon
  }
]

const WhyCardV2 = ({ title, description, icon, index }) => {
  const cardRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePos({ x, y })
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1 })

    if (cardRef.current) observer.observe(cardRef.current)
    return () => { if (cardRef.current) observer.unobserve(cardRef.current) }
  }, [])

  return (
    <div 
      ref={cardRef} 
      className="why-card-v2 reveal-on-scroll"
      style={{ 
        '--mouse-x': `${mousePos.x}%`, 
        '--mouse-y': `${mousePos.y}%`,
        animationDelay: `${index * 0.15}s`
      }}
    >
      <div className="why-icon-container">
        <img src={icon} alt={title} className="why-card-icon-v2" />
      </div>
      <div className="why-card-content-v2">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

const WhyChooseUs = () => {
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

  return (
    <section
      id="afzalliklar"
      className="why-choose-us relative overflow-hidden py-20 md:py-28"
      aria-labelledby="afzalliklar-heading"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(100vw,720px)] w-[min(100vw,720px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
        <div className="bg-grid absolute inset-0 opacity-40" />
      </div>

      <div className="site-container relative z-10">
        <div ref={titleRef} className="reveal-on-scroll mb-16 text-center md:mb-20">
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-[#d946ef]">Afzalliklarimiz</span>
          <h2 id="afzalliklar-heading" className="mb-6 text-3xl font-black tracking-tight text-white md:text-5xl">
            Nega ota-onalar <span className="text-[#d946ef]">&quot;birbola&quot;</span> ni tanlaydi?
          </h2>
          <div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-transparent via-[#d946ef] to-transparent opacity-80" />
        </div>

        <div className="why-grid-v2 relative">
          <div className="why-connector" aria-hidden>
            <div className="why-connector-inner">
              <div className="why-connector-ring" />
              <div className="why-connector-ring" />
              <div className="why-center-orb relative m-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[0_0_30px_rgba(217,70,239,0.2)] backdrop-blur-xl md:h-28 md:w-28">
                <div className="absolute inset-0 rounded-full bg-[#d946ef]/10 blur-xl" />
                <img src={logoIcon} alt="" className="why-orb-icon relative z-10 h-12 w-12 opacity-90 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] md:h-14 md:w-14" width={64} height={64} />
              </div>
            </div>
          </div>

          {features.map((feature, index) => (
            <WhyCardV2
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
