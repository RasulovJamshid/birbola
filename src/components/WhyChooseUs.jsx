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
    <section className="why-choose-us py-32 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-30" />
        <div className="section-glow glow-gold opacity-30 blur-[150px] scale-[1.5]" />
      </div>

      <div className="site-container relative z-10">
        <div ref={titleRef} className="reveal-on-scroll text-center mb-24">
          <span className="text-[#d946ef] font-bold text-sm tracking-widest uppercase mb-4 block">Afzalliklarimiz</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Nega ota-onalar <span className="text-[#d946ef]">"birbola"</span> ni tanlaydi?
          </h2>
          <div className="w-24 h-1 bg-[#d946ef] mx-auto rounded-full opacity-50" />
        </div>

        <div className="why-grid-v2 relative">
          {/* Central Animated Element */}
          <div className="why-connector">
            <div className="why-connector-inner">
              <div className="why-connector-ring" />
              <div className="why-connector-ring" />
              <div className="why-center-orb !animate-none !shadow-none !translate-x-0 !translate-y-0 !static !w-32 !h-32 !p-4 !m-auto flex items-center justify-center">
                <img src={logoIcon} alt="Birbola" className="why-orb-icon !w-20 !h-20" />
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
