import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { getKindergartens } from '../services/api'
import Logo from '../assets/birbola.svg'
import FamilyCenter from '../assets/banner/family-center.png'
import FamilyIcon from '../assets/banner/family.svg'
import BuildingIcon from '../assets/banner/building.svg'
import HorseToyIcon from '../assets/banner/horse-toy.svg'
import MapPointIcon from '../assets/banner/map-point.svg'
import VideoIcon from '../assets/banner/video.svg'
import SearchIcon from '../assets/banner/search.svg'
import BookIcon from '../assets/banner/book.svg'

const Hero = () => {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setLoading(true)
        try {
          const response = await getKindergartens({
            search: searchQuery,
            pageSize: 5,
            pageNumber: 1
          })
          const items = Array.isArray(response) ? response : response?.data || response?.items || []
          setResults(items)
          setShowResults(true)
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = () => {
    navigate(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
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
  const orbitalTransform = `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`

  return (
    <section className="hero" ref={heroRef}>
      {/* Background Wrapper */}
      <div className="hero-bg-wrapper">
        <div className="hero-top-glow" />
        {/* Pink glow ellipse with parallax */}
        <div 
          className="hero-glow" 
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
              <div className="orbital-pill">Ishonchli</div>
            </div>

            <div className="orbital-item orbital-item-ishonchli-right">
              <div className="orbital-pill">Ishonchli</div>
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
        <div className="hero-search">
          <span className="hero-search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Bog'cha izlash"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setResults([])
                setShowResults(false)
              }}
              className="text-gray-400 hover:text-white transition-colors p-1"
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
                  navigate(`/kindergarten/${kg.id}`)
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
