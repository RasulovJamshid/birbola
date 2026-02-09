'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Users, Heart, Shield, Sparkles, Award, TrendingUp, Globe, CheckCircle2, ArrowRight } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

// Simple Reveal Component for scroll animations
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className={`transition-all duration-1000 ease-out ${className} ${
      isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-md'
    }`}>
      {children}
    </div>
  )
}

const AboutUs = () => {
  const router = useRouter()

  const values = [
    {
      icon: Shield,
      title: 'Ishonch',
      description: 'Har bir bog\'cha haqida to\'liq va ishonchli ma\'lumotlar taqdim etamiz',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    {
      icon: Heart,
      title: 'G\'amxo\'rlik',
      description: 'Farzandingiz uchun eng yaxshi ta\'lim muhitini topishda yordam beramiz',
      color: 'from-pink-500/20 to-rose-500/20',
      iconColor: 'text-rose-400'
    },
    {
      icon: Sparkles,
      title: 'Sifat',
      description: 'Faqat tekshirilgan va sifatli bog\'chalarni platformamizga qo\'shamiz',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400'
    },
    {
      icon: Users,
      title: 'Jamiyat',
      description: 'Ota-onalar o\'rtasida tajriba almashish imkoniyatini yaratamiz',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400'
    }
  ]

  const stats = [
    { value: '500+', label: 'Bog\'chalar', icon: Globe },
    { value: '10,000+', label: 'Ota-onalar', icon: Users },
    { value: '50+', label: 'Shaharlar', icon: TrendingUp },
    { value: '4.8/5', label: 'Reyting', icon: Award }
  ]

  const features = [
    'Barcha bog\'chalar haqida to\'liq ma\'lumot',
    'Ota-onalarning sharhlari va reytinglari',
    'Qulay qidiruv va filtrlar',
    'Jamiyat bo\'limi orqali tajriba almashish',
    'Bog\'chalar bilan to\'g\'ridan-to\'g\'ri aloqa',
    'Bepul va oson foydalanish'
  ]

  return (
    <div className="min-h-screen bg-[#090318] text-white selection:bg-[#d946ef]/30">
      <Header enableSticky={true} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Immersive Background Aurora */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#d946ef]/10 blur-[140px] rounded-full animate-float-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#6366f1]/10 blur-[140px] rounded-full animate-float-slow" style={{ animationDelay: '-5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-grid opacity-20" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="text-center mb-20">
            <Reveal delay={100}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full mb-8 shadow-2xl">
                <Sparkles size={16} className="text-[#d946ef] animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Platforma haqida</span>
              </div>
            </Reveal>
            
            <Reveal delay={300}>
              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
                Birbola — <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] via-[#ec4899] to-[#6366f1] animate-gradient-x">
                  Kelajak sari
                </span>
                <br /> ilk qadamlar
              </h1>
            </Reveal>
            
            <Reveal delay={500}>
              <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
                Ota-onalarga farzandlari uchun eng yaxshi ta'lim maskanini topishda 
                ko'maklashuvchi eng yirik raqamli hamkor.
              </p>
            </Reveal>
          </div>

          {/* Animated Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <Reveal key={index} delay={600 + index * 100}>
                <div className="group relative bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 text-center hover:bg-white/[0.05] transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d946ef]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-[#d946ef] opacity-50 group-hover:opacity-100 transition-all duration-500" />
                  <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section with Reveal */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <Reveal delay={200} className="space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#d946ef]/10 backdrop-blur-3xl border border-[#d946ef]/20 rounded-full">
                <Target size={18} className="text-[#d946ef]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#d946ef]">Missiya</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tighter">
                Har bir bola uchun
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#6366f1]"> ideal muhit </span>
              </h2>
              
              <div className="space-y-6 text-white/50 text-lg leading-loose">
                <p>Biz ota-onalarning vaqtini tejash va farzandlari uchun eng ishonchli ta'lim muhitini tanlashlarida ko'prik vazifasini o'taymiz.</p>
                <p>Ma'lumotlar ochiqligi va jamiyat ishonchi — bizning asosiy ustuvorligimizdir.</p>
              </div>
            </Reveal>

            <Reveal delay={400} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#d946ef]/20 to-[#6366f1]/20 blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-3xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d946ef]/10 blur-[60px] rounded-full" />
                <div className="space-y-5">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.08] transition-all duration-300 hover:translate-x-2"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#d946ef]/10 flex items-center justify-center border border-[#d946ef]/20">
                        <CheckCircle2 className="w-4 h-4 text-[#d946ef]" />
                      </div>
                      <span className="text-white/80 font-bold text-sm tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values Section - Staggered Grid */}
      <section className="py-32 px-6 relative bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <Reveal delay={100}>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                Bizning <span className="text-[#d946ef]">qadriyatlar</span>
              </h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-[#d946ef] to-[#6366f1] mx-auto rounded-full" />
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Reveal key={index} delay={200 + index * 150}>
                <div className="h-full bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 hover:bg-white/[0.06] transition-all duration-500 group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-2xl border border-white/10`}>
                    <value.icon className={`w-8 h-8 ${value.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-[#d946ef] transition-colors">{value.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient & Animation */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <Reveal delay={100}>
            <div className="relative group bg-gradient-to-br from-[#1b1235] to-[#090318] border border-white/10 rounded-[60px] p-16 text-center overflow-hidden shadow-3xl">
              <div className="absolute inset-0 bg-[#d946ef]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d946ef]/10 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#6366f1]/10 blur-[100px] rounded-full" />
              
              <div className="relative z-10 space-y-10">
                <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tighter">
                  Eng yaxshi tanlov <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#6366f1]">
                    Birbola bilan
                  </span>
                </h2>
                
                <p className="text-lg text-white/40 max-w-xl mx-auto font-medium">
                  Minglab ota-onalar ishonchini qozongan platformamizga siz ham qo'shiling.
                </p>
                
                <button
                  onClick={() => router.push('/search')}
                  className="group inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-black text-lg rounded-[28px] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500"
                >
                  Boshlash
                  <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutUs