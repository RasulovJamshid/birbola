'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { getKindergartens } from '../services/api'
// Assets now served from public folder
const Logo = '/assets/birbola.svg'
const NoiseTexture = '/assets/top/noise.png'
const FamilyCenter = '/assets/banner/family-center.png'
const FamilyIcon = '/assets/banner/family.svg'
const BuildingIcon = '/assets/banner/building.svg'
const HorseToyIcon = '/assets/banner/horse-toy.svg'
const MapPointIcon = '/assets/banner/map-point.svg'
const VideoIcon = '/assets/banner/video.svg'
const SearchIcon = '/assets/banner/search.svg'
const BookIcon = '/assets/banner/book.svg'

const Hero = () => {
  const router = useRouter()
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [stats, setStats] = useState({ kindergartens: 0, parents: 0, cities: 0 })

  // Animate statistics on mount
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

      if (step >= steps) {
        clearInterval(timer)
        setStats(targets)
      }
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
          const response = await getKindergartens({
            search: searchQuery,
            pageSize: 5,
            pageNumber: 1
          }, { signal: controller.signal })

          if (!controller.signal.aborted) {
            const items = Array.isArray(response) ? response : response?.data || response?.items || []
            setResults(items)
            setShowResults(true)
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error(err)
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        }
      } else {
        setResults([])
        setShowResults(false)
        setLoading(false)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchQuery])

  const handleSearch = () => {
    router.push(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      // Normalize mouse position to -1 to 1 range
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      setMousePos({ x, y })
    }

    const heroEl = heroRef.current
    if (heroEl) {
      heroEl.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (heroEl) {
        heroEl.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  // Parallax transform values
  const glowTransform = `translateX(calc(-50% + ${mousePos.x * 30}px)) translateY(calc(40% + ${mousePos.y * 20}px))`
  // Keep orbital illustration statically centered (no mouse-based offset)
  const orbitalTransform = 'translate(0px, 0px)'

  return (
    <section className="hero" ref={heroRef}>
      {/* Background Wrapper */}
      <div className="hero-bg-wrapper">
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `url(${NoiseTexture})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          zIndex: 1
        }} />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
          {[
            { size: 6, left: 10, top: 20, duration: 18, delay: 0 },
            { size: 4, left: 25, top: 60, duration: 22, delay: 2 },
            { size: 8, left: 40, top: 15, duration: 20, delay: 4 },
            { size: 5, left: 55, top: 70, duration: 25, delay: 1 },
            { size: 7, left: 70, top: 30, duration: 21, delay: 3 },
            { size: 4, left: 85, top: 50, duration: 23, delay: 5 },
            { size: 6, left: 15, top: 80, duration: 19, delay: 2 },
            { size: 5, left: 90, top: 10, duration: 24, delay: 4 },
            { size: 8, left: 60, top: 85, duration: 17, delay: 1 },
            { size: 4, left: 35, top: 40, duration: 22, delay: 3 },
            { size: 6, left: 50, top: 25, duration: 20, delay: 6 },
            { size: 5, left: 80, top: 75, duration: 23, delay: 7 }
          ].map((particle, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `floatParticle ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)'
              }}
            />
          ))}
        </div>
        
        <div className="hero-top-glow" />

        {/* Layered Design Glows */}
        <div className="hero-glow-container">
          <div className="glow-blue absolute w-[1200px] h-[1200px] -left-[400px] -top-[200px] opacity-40 blur-[80px]" />
          <div className="glow-gold absolute w-[1000px] h-[1000px] left-[20%] -top-[400px] opacity-30 blur-[100px]" />
          <div className="glow-green absolute w-[800px] h-[800px] -right-[200px] top-[10%] opacity-20 blur-[90px]" />
        </div>

        {/* Pink glow ellipse with parallax */}
        <div
          className="hero-glow glow-pink"
          style={{ transform: glowTransform }}
        />
      </div>

      <div className="hero-inner relative z-10">
        {/* Left side - Text block */}
        <div className="hero-left">
          <h1>
            <span>"Bir bola" bilan</span>
            <span>kelajakka ilk qadam</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-md">
            Farzandingiz uchun eng yaxshi bog'chani toping. Minglab ota-onalar ishongan platforma.
          </p>
          
          {/* Statistics */}
          <div className="mt-8 flex flex-wrap gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{stats.kindergartens}+</span>
              <span className="text-sm text-white/60 mt-1">Bog'chalar</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{stats.parents.toLocaleString()}+</span>
              <span className="text-sm text-white/60 mt-1">Ota-onalar</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white">{stats.cities}+</span>
              <span className="text-sm text-white/60 mt-1">Shaharlar</span>
            </div>
          </div>
        </div>

        {/* Right side - Orbital illustration with parallax */}
        <div className="hero-right">
          <div
            className="orbital"
            style={{
              '--mouse-x': mousePos.x,
              '--mouse-y': mousePos.y,
              transform: orbitalTransform,
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* Orbit rings */}
            <div className="orbital-ring orbital-ring-1" />
            <div className="orbital-ring orbital-ring-2" />
            <div className="orbital-ring orbital-ring-3" />

            {/* Central circle with family photo */}
            <div className="orbital-center">
              <img src={FamilyCenter} alt="Family" />
            </div>

            {/* Orbital items - Icons */}
            <div className="orbital-item orbital-item-family">
              <div className="orbital-icon">
                <img src={FamilyIcon} alt="Family" />
              </div>
            </div>

            <div className="orbital-item orbital-item-building">
              <div className="orbital-icon">
                <img src={BuildingIcon} alt="Building" />
              </div>
            </div>

            <div className="orbital-item orbital-item-horse">
              <div className="orbital-icon">
                <img src={HorseToyIcon} alt="Horse Toy" />
              </div>
            </div>

            <div className="orbital-item orbital-item-map">
              <div className="orbital-icon">
                <img src={MapPointIcon} alt="Map Point" />
              </div>
            </div>

            <div className="orbital-item orbital-item-video">
              <div className="orbital-icon orbital-icon-small">
                <img src={VideoIcon} alt="Video" />
              </div>
            </div>

            <div className="orbital-item orbital-item-search">
              <div className="orbital-icon orbital-icon-small">
                <img src={SearchIcon} alt="Search" />
              </div>
            </div>

            <div className="orbital-item orbital-item-book">
              <div className="orbital-icon orbital-icon-small">
                <img src={BookIcon} alt="Book" />
              </div>
            </div>

            {/* Orbital items - Pills */}
            <div className="orbital-item orbital-item-qulay">
              <div className="orbital-pill">Qulay</div>
            </div>

            <div className="orbital-item orbital-item-ishonchli-top">
              <div className="orbital-pill">Xavfsiz</div>
            </div>

            <div className="orbital-item orbital-item-ishonchli-right">
              <div className="orbital-pill">Sifatli</div>
            </div>

            <div className="orbital-item orbital-item-ishonchli-bottom">
              <div className="orbital-pill">Ishonchli</div>
            </div>

            <div className="orbital-item orbital-item-izlash">
              <div className="orbital-pill">Izlash onson</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar at bottom */}
      <div className="hero-search-wrapper relative">
        <div className="hero-search relative flex items-center">
          <span className="hero-search-icon absolute left-4" onClick={handleSearch} style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Bog'cha izlash"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-10 py-3 bg-transparent text-white placeholder-white/60 focus:outline-none"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin">
              <Loader2 size={20} />
            </span>
          )}
          {searchQuery && !loading && (
            <button
              onClick={() => {
                setSearchQuery('')
                setResults([])
                setShowResults(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-6 right-6 mt-4 bg-white rounded-3xl shadow-xl overflow-hidden z-50">
            {results.map(kg => (
              <div
                key={kg.id}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/kindergarten/${kg.id}`)
                }}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm">{kg.name}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  <img
                    src={kg.profilePhoto || Logo}
                    alt={kg.name}
                    className={`w-full h-full ${kg.profilePhoto ? 'object-cover' : 'object-contain p-1'}`}
                    onError={(e) => {
                      e.target.src = Logo
                      e.target.className = "w-full h-full object-contain p-1"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
