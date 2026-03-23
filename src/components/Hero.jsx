'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Search, ArrowRight, ChevronDown, Sparkles, MapPinned, ShieldCheck, Users } from 'lucide-react'
import { getKindergartens } from '../services/api'

const Logo = '/assets/birbola.svg'
const NoiseTexture = '/assets/top/noise.png'

const CYCLING_WORDS = ['kelajakka', 'muvaffaqiyatga', 'baxtga', 'ta\'limga']

const Hero = () => {
  const router = useRouter()
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [stats, setStats] = useState({ kindergartens: 0, parents: 0, cities: 0 })
  const [wordIndex, setWordIndex] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Mount trigger for entrance animations
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Cycling word animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false)
      setTimeout(() => {
        setWordIndex(i => (i + 1) % CYCLING_WORDS.length)
        setWordVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  // Animate statistics
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    const targets = { kindergartens: 500, parents: 10000, cities: 50 }
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setStats({
        kindergartens: Math.floor(targets.kindergartens * easeOut),
        parents: Math.floor(targets.parents * easeOut),
        cities: Math.floor(targets.cities * easeOut)
      })
      if (step >= steps) { clearInterval(timer); setStats(targets) }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  // Debounce search
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        setLoading(true)
        try {
          const response = await getKindergartens({ search: searchQuery, pageSize: 5, pageNumber: 1 }, { signal: controller.signal })
          if (!controller.signal.aborted) {
            const items = Array.isArray(response) ? response : response?.data || response?.items || []
            setResults(items)
            setShowResults(true)
          }
        } catch (err) {
          if (err.name !== 'AbortError') console.error(err)
        } finally {
          if (!controller.signal.aborted) setLoading(false)
        }
      } else {
        setResults([]); setShowResults(false); setLoading(false)
      }
    }, 500)
    return () => { clearTimeout(timer); controller.abort() }
  }, [searchQuery])

  const handleSearch = () => {
    router.push(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      })
    }
    const heroEl = heroRef.current
    if (heroEl) heroEl.addEventListener('mousemove', handleMouseMove)
    return () => { if (heroEl) heroEl.removeEventListener('mousemove', handleMouseMove) }
  }, [])

  const glowTransform = `translateX(calc(-50% + ${mousePos.x * 30}px)) translateY(calc(40% + ${mousePos.y * 20}px))`

  return (
    <section className="hero" ref={heroRef}>
      {/* Background */}
      <div className="hero-bg-wrapper">
        {/* Noise */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `url(${NoiseTexture})`, backgroundRepeat: 'repeat', backgroundSize: 'auto', zIndex: 1
        }} />

        {/* Aurora beams */}
        <div className="hero-aurora" />

        {/* Grid */}
        <div className="hero-grid" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          {[
            { size: 3, left: 10, top: 20, duration: 18, delay: 0 },
            { size: 2, left: 25, top: 60, duration: 22, delay: 2 },
            { size: 4, left: 40, top: 15, duration: 20, delay: 4 },
            { size: 3, left: 55, top: 70, duration: 25, delay: 1 },
            { size: 4, left: 70, top: 30, duration: 21, delay: 3 },
            { size: 2, left: 85, top: 50, duration: 23, delay: 5 },
            { size: 3, left: 15, top: 80, duration: 19, delay: 2 },
            { size: 2, left: 90, top: 10, duration: 24, delay: 4 },
            { size: 4, left: 60, top: 85, duration: 17, delay: 1 },
            { size: 3, left: 35, top: 40, duration: 22, delay: 3 },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: `${p.size}px`, height: `${p.size}px`,
                left: `${p.left}%`, top: `${p.top}%`,
                animation: `floatParticle ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                background: 'rgba(255,255,255,0.6)',
                boxShadow: '0 0 6px rgba(255,255,255,0.4)'
              }}
            />
          ))}
        </div>

        <div className="hero-top-glow" />
        <div className="hero-glow-container">
          <div className="glow-blue absolute w-[1200px] h-[1200px] -left-[400px] -top-[200px] opacity-40 blur-[80px]" />
          <div className="glow-gold absolute w-[1000px] h-[1000px] left-[20%] -top-[400px] opacity-30 blur-[100px]" />
        </div>
        <div className="hero-glow glow-pink" style={{ transform: glowTransform }} />
      </div>

      <div className="hero-inner relative z-10">
        {/* Left - Text */}
        <div className={`hero-left ${mounted ? 'hero-left--visible' : ''}`}>
          {/* Label badge */}
          <div className="hero-badge" style={{ animationDelay: '0s' }}>
            <span className="hero-badge-dot" />
            O&apos;zbekistondagi #1 bog&apos;cha platformasi
          </div>

          <h1 className="hero-headline" style={{ animationDelay: '0.1s' }}>
            &ldquo;Bir bola&rdquo; bilan
            <br />
            <span className={`hero-word-cycle ${wordVisible ? 'hero-word-cycle--in' : 'hero-word-cycle--out'}`}>
              {CYCLING_WORDS[wordIndex]}
            </span>
            <br />
            <span className="hero-headline-plain">ilk qadam</span>
          </h1>

          <p className="hero-subtitle" style={{ animationDelay: '0.25s' }}>
            Farzandingiz uchun eng yaxshi bog&apos;chani toping.
            <br />
            Minglab ota-onalar ishongan platforma.
          </p>

          {/* Search bar - Relocated for better balance */}
          <div className="hero-search-wrapper relative mt-12" style={{ animationDelay: '0.32s' }}>
            <div className="hero-search relative flex items-center group !max-w-[640px] !w-full">
              <span className="hero-search-icon" onClick={handleSearch} style={{ cursor: 'pointer', flexShrink: 0 }}>
                <Search size={22} className="text-white/40 group-focus-within:text-[#d946ef] transition-colors" />
              </span>
              <input
                type="text"
                placeholder="Bog'cha nomi yoki manzili..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent text-white placeholder-white/30 focus:outline-none text-lg font-medium flex-1 ml-2"
              />
              {loading && (
                <span className="text-white/40 animate-spin ml-2 flex-shrink-0">
                  <Loader2 size={20} />
                </span>
              )}
              {searchQuery && !loading && (
                <button
                  onClick={() => { setSearchQuery(''); setResults([]); setShowResults(false) }}
                  className="text-white/30 hover:text-white/80 transition-colors ml-2 flex-shrink-0 p-1.5 bg-white/5 hover:bg-white/10 rounded-full"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="hero-search-btn ml-4 !px-8 !py-3 text-base"
              >
                Izlash
              </button>
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 max-w-[640px] bg-[#1a0b3b]/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[60] border border-white/10 animate-fadeIn">
                <div className="p-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Natijalar</span>
                  <button onClick={() => setShowResults(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/40 transition-colors"><X size={14} /></button>
                </div>
                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                  {results.map(kg => (
                    <div
                      key={kg.id}
                      onClick={(e) => { e.stopPropagation(); router.push(`/kindergarten/${kg.id}`) }}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-[#d946ef]/10 cursor-pointer border-b last:border-0 border-white/5 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 group-hover:border-[#d946ef]/50 transition-colors">
                        <img
                          src={kg.profilePhoto || Logo}
                          alt={kg.name}
                          className={`w-full h-full ${kg.profilePhoto ? 'object-cover' : 'object-contain p-2 opacity-40'}`}
                          onError={(e) => { e.target.src = Logo; e.target.className = "w-full h-full object-contain p-2 opacity-40" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-base group-hover:text-[#d946ef] transition-colors truncate">{kg.name}</h4>
                        <p className="text-white/40 text-xs truncate mt-0.5">{kg.address || 'Manzil ko\'rsatilmagan'}</p>
                      </div>
                      <ArrowRight size={16} className="text-white/20 group-hover:text-[#d946ef] group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleSearch}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-[#d946ef] text-xs font-black uppercase tracking-widest transition-colors border-t border-white/5"
                >
                  Barcha natijalarni ko'rish
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="hero-stats mt-16" style={{ animationDelay: '0.42s' }}>
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.kindergartens}+</span>
              <span className="hero-stat-label">Bog&apos;chalar</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.parents.toLocaleString()}+</span>
              <span className="hero-stat-label">Ota-onalar</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{stats.cities}+</span>
              <span className="hero-stat-label">Shaharlar</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-10" style={{ animationDelay: '0.52s' }}>
            <button className="btn-primary !px-10 !py-4 text-base" onClick={handleSearch}>
              Bog&apos;cha toping
              <ArrowRight size={20} />
            </button>
            <a href="/about" className="btn-secondary !px-10 !py-4 text-base">
              Batafsil
            </a>
          </div>
        </div>

        {/* Right - Showcase */}
        <div className="hero-right" style={{ perspective: '1200px' }}>
          <div
            className="hero-flow"
            style={{
              transform: `rotateX(${-mousePos.y * 6}deg) rotateY(${mousePos.x * 6}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <div className="flow-aurora flow-aurora-1" />
            <div className="flow-aurora flow-aurora-2" />
            <div className="flow-aurora flow-aurora-3" />
            <div className="flow-spotlight flow-spotlight-1" />
            <div className="flow-spotlight flow-spotlight-2" />
            <div className="flow-lane flow-lane-1" />
            <div className="flow-lane flow-lane-2" />
            <div className="flow-lane flow-lane-3" />
            <div className="flow-wave flow-wave-1" />
            <div className="flow-wave flow-wave-2" />
            <div className="flow-burst flow-burst-1" />
            <div className="flow-burst flow-burst-2" />
            <span className="flow-particle flow-particle-1" />
            <span className="flow-particle flow-particle-2" />
            <span className="flow-particle flow-particle-3" />
            <span className="flow-particle flow-particle-4" />
            <span className="flow-particle flow-particle-5" />
            <span className="flow-particle flow-particle-6" />
            <span className="flow-comet flow-comet-1" />
            <span className="flow-comet flow-comet-2" />

            <div className="flow-chip flow-chip-top-left">
              <Sparkles size={16} />
              <span>AI tavsiya</span>
            </div>

            <div className="flow-chip flow-chip-top-right">
              <MapPinned size={16} />
              <span>50+ shahar</span>
            </div>

            <div className="flow-chip flow-chip-bottom-left">
              <Users size={16} />
              <span>10K+ ota-ona</span>
            </div>

            <div className="flow-chip flow-chip-bottom-right">
              <ShieldCheck size={16} />
              <span>Tasdiqlangan</span>
            </div>

            <div className="flow-core">
              <div className="flow-core-halo" />
              <div className="flow-core-icon">
                <Search size={22} />
              </div>
              <div className="flow-core-title">Tezkor qidiruv oqimi</div>
              <div className="flow-core-subtitle">Mos bog&apos;chani yorug&apos;lik tezligidek topadigan zamonaviy tajriba</div>
              <div className="flow-core-pulse">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <span className="hero-scroll-text">Pastga suring</span>
        <ChevronDown size={18} className="hero-scroll-arrow" />
      </div>
    </section>
  )
}

export default Hero
