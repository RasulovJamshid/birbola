'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Star, MapPin, Loader2 } from 'lucide-react'
import { getKindergartens } from '../services/api'
// Assets now served from public folder
const Logo = '/assets/birbola.svg'
const RocketIcon = '/assets/rocket.svg'

// Fallback data in case API fails
const fallbackKindergartens = [
  {
    id: 1,
    name: "Sodiq school",
    profilePhoto: null,
    score: 5,
    location: "Toshkent shaxri",
    district: { districtName: "Yunusobod tumani" }
  },
  {
    id: 2,
    name: "Bilim Maskani",
    profilePhoto: null,
    score: 5,
    location: "Toshkent shaxri",
    district: { districtName: "Chilonzor tumani" }
  },
  {
    id: 3,
    name: "Kelajak Avlodi",
    profilePhoto: null,
    score: 4.8,
    location: "Toshkent shaxri",
    district: { districtName: "Sergeli tumani" }
  },
  {
    id: 4,
    name: "Jahon School",
    profilePhoto: null,
    score: 4.9,
    location: "Toshkent shaxri",
    district: { districtName: "Mirobod tumani" }
  },
  {
    id: 5,
    name: "Happy Kids",
    profilePhoto: null,
    score: 4.7,
    location: "Toshkent shaxri",
    district: { districtName: "Yakkasaroy tumani" }
  }
]

// Carousel configuration - full circle, front quarter visible
const FULL_CIRCLE = 360
const VISIBLE_ARC = 90 // degrees of the circle that are actually visible
const RADIUS_X = 420 // horizontal radius of the arc
const RADIUS_Y = 140 // vertical depth of the arc

const TopBogchalar = () => {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(1)
  const [activeTab, setActiveTab] = useState('bogcha')
  const [kindergartens, setKindergartens] = useState(fallbackKindergartens)
  const [loading, setLoading] = useState(true)

  // Fetch top kindergartens from API
  useEffect(() => {
    async function fetchTopKindergartens() {
      try {
        const response = await getKindergartens({
          pageSize: 10,
          pageNumber: 1,
          score: 4 // Get top-rated kindergartens
        })

        const items = Array.isArray(response)
          ? response
          : response?.data || response?.items || []

        if (items.length > 0) {
          setKindergartens(items)
        }
      } catch (err) {
        console.error('Error fetching top kindergartens:', err)
        // Keep fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchTopKindergartens()
  }, [])

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + kindergartens.length) % kindergartens.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % kindergartens.length)
  }

  const handleCardClick = (kg, index) => {
    if (index === activeIndex) {
      // Navigate to detail page if clicking the active card
      router.push(`/kindergarten/${kg.id}`)
    } else {
      // Otherwise just focus the card
      setActiveIndex(index)
    }
  }

  const getCardStyle = (index) => {
    const total = kindergartens.length

    // Calculate normalized offset from active index
    let offset = (index - activeIndex) % total
    if (offset < -total / 2) offset += total
    if (offset > total / 2) offset -= total

    // Only show center card and immediate neighbors clearly
    const absOffset = Math.abs(offset)
    const isVisible = absOffset <= 2

    if (!isVisible) {
      return { display: 'none' }
    }

    // specific styles for 3 slots
    let styles = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: '320px', // slightly wider base width
      marginLeft: '-160px',
      marginTop: '-200px', // center vertically
      transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      zIndex: 50 - absOffset * 10,
      opacity: 1 - absOffset * 0.3,
    }

    if (offset === 0) {
      // Center card
      styles.transform = `translate3d(0, 0, 0) scale(1) rotateZ(0deg)`
    } else if (offset === -1) {
      // Left card - tilted left
      styles.transform = `translate3d(-340px, -60px, 50px) scale(0.9) rotateZ(15deg)`
    } else if (offset === 1) {
      // Right card - tilted right
      styles.transform = `translate3d(340px, -60px, 50px) scale(0.9) rotateZ(-15deg)`
    } else if (offset === -2) {
      // Far Left
      styles.transform = `translate3d(-550px, 120px, -100px) scale(0.8) rotateZ(30deg)`
      styles.opacity = 0
    } else if (offset === 2) {
      // Far Right
      styles.transform = `translate3d(550px, 120px, -100px) scale(0.8) rotateZ(-30deg)`
      styles.opacity = 0
    }

    return styles
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
      />
    ))
  }

  return (
    <section className="py-20 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #7B1FA2 0%, #4A148C 50%, #1A0B2E 100%)',
      position: 'relative'
    }}>
      {/* Noise overlay with transparency */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'url(/assets/top/noise.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }} />
      {/* Background Effects */}
      <div className="bg-grid opacity-70" />
      <div className="pink-rising-arc -top-[450px]" />
      <div className="section-glow bottom-0 left-1/4 glow-blue opacity-40" />
      <div className="section-glow bottom-0 right-1/4 glow-pink opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-16 relative z-10">
          <div className="top-bogchalar-title">
            <h2 className="text-white">Top</h2>
            <div className="top-bogchalar-badge-container">
              <span className="top-bogchalar-badge-text">bog'chalar</span>
            </div>
            <img src={RocketIcon} alt="rocket" className="w-12 h-12" />
          </div>

          {/* Barchasi Button */}
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#d946ef] text-white font-medium rounded-full hover:bg-[#c026d3] transition-all shadow-lg"
          >
            Barchasi
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Curved Carousel */}
        <div className="relative" style={{ height: '480px', perspective: '1200px' }}>
          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#d946ef] animate-spin" />
            </div>
          )}

          {/* Cards Container */}
          <div
            className={`relative w-full h-full flex items-center justify-center transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {kindergartens.map((kg, index) => (
              <div
                key={kg.id}
                style={getCardStyle(index)}
                className="w-[280px] cursor-pointer"
                onClick={() => handleCardClick(kg, index)}
              >
                {/* Card */}
                <div className={`bg-white rounded-[32px] overflow-hidden shadow-2xl transition-all ${index === activeIndex ? 'ring-2 ring-[#d946ef] ring-offset-2' : ''}`}>
                  {/* Card Header - Name */}
                  <div className="px-5 pt-5 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {kg.name}
                    </h3>
                  </div>

                  {/* Card Image */}
                  <div className="px-4">
                    <div className="h-48 rounded-2xl bg-gradient-to-br from-[#1a1a4e] to-[#2a2a6e] flex items-center justify-center relative overflow-hidden">
                      <img
                        src={kg.profilePhoto || Logo}
                        alt={kg.name}
                        className={`w-full h-full rounded-2xl ${kg.profilePhoto ? 'object-cover' : 'object-contain p-8'}`}
                        onError={(e) => {
                          e.target.src = Logo
                          e.target.className = "w-full h-full object-contain p-8 rounded-2xl"
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{kg.location || 'Toshkent shaxri'}</p>
                        <p className="text-gray-500 text-sm">{kg.district?.districtName || kg.districtName || 'Tuman'}</p>
                        <div className="flex items-center gap-0.5 mt-2">
                          {renderStars(kg.score || kg.rating || 5)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-50 shadow-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-50 shadow-lg"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {kindergartens.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === activeIndex
                ? 'bg-white w-6'
                : 'bg-white/40 hover:bg-white/60'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopBogchalar
