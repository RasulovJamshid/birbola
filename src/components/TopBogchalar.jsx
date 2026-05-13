'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Star, MapPin, Loader2, Building2, RefreshCw, WifiOff } from 'lucide-react'
import { getKindergartens } from '../services/api'
// Assets now served from public folder
const Logo = '/assets/birbola.svg'
const RocketIcon = '/assets/rocket.svg'

/** Pool size (API max 100) to find the newest entries before slicing */
const LATEST_POOL_PAGE_SIZE = 100
const LATEST_SHOW_COUNT = 10

function latestKindergartenTimestamp(kg) {
  if (!kg || typeof kg !== 'object') return 0
  const keys = [
    'createdAt', 'CreatedAt',
    'createdDate', 'CreatedDate',
    'whenCreated', 'WhenCreated',
    'dateCreated', 'DateCreated',
    'created', 'Created',
  ]
  for (const k of keys) {
    const v = kg[k]
    if (v == null || v === '') continue
    const t = new Date(v).getTime()
    if (!Number.isNaN(t) && t > 0) return t
  }
  const id = Number(kg.id)
  return Number.isFinite(id) ? id : 0
}

function pickLatestKindergartens(items, limit = LATEST_SHOW_COUNT) {
  if (!Array.isArray(items)) return []
  return [...items]
    .sort((a, b) => {
      const tb = latestKindergartenTimestamp(b)
      const ta = latestKindergartenTimestamp(a)
      if (tb !== ta) return tb - ta
      return (Number(b.id) || 0) - (Number(a.id) || 0)
    })
    .slice(0, limit)
}

const TopBogchalar = () => {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [kindergartens, setKindergartens] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)

  const loadTopKindergartens = useCallback(async () => {
    setLoading(true)
    setFetchError(false)
    try {
      const response = await getKindergartens({
        pageNumber: 1,
        pageSize: LATEST_POOL_PAGE_SIZE,
        sort: 0,
      })

      const items = Array.isArray(response)
        ? response
        : response?.data || response?.items || []

      setKindergartens(pickLatestKindergartens(Array.isArray(items) ? items : [], LATEST_SHOW_COUNT))
    } catch (err) {
      console.error('Error fetching top kindergartens:', err)
      setKindergartens([])
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTopKindergartens()
  }, [loadTopKindergartens])

  useEffect(() => {
    if (kindergartens.length === 0) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((i) => Math.min(i, kindergartens.length - 1))
  }, [kindergartens.length])

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
    const n = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)))
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500/50'}`}
      />
    ))
  }

  const formatRating = (kg) => {
    const raw = kg.score ?? kg.rating
    if (raw === undefined || raw === null || raw === '') return null
    const num = Number(raw)
    if (Number.isNaN(num)) return null
    return num.toFixed(1)
  }

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
      id="top-bogchalar"
      className="relative overflow-hidden border-t border-white/5 bg-[#090318] py-20 md:py-28"
      style={{
        background: 'linear-gradient(180deg, var(--color-page-bg) 0%, #0c061f 45%, var(--color-page-bg) 100%)',
      }}
      aria-labelledby="top-bogchalar-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217, 70, 239, 0.12) 0%, transparent 55%)',
        }}
      />

      <div className="site-container relative z-10">
        <div
          ref={titleRef}
          className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between md:mb-16 reveal-on-scroll"
        >
          <div>
            <span className="mb-3 block text-sm font-bold uppercase tracking-widest text-[#d946ef]">
              Reyting bo&apos;yicha
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="top-bogchalar-heading" className="text-3xl font-black tracking-tight text-white md:text-5xl">
                Top bog&apos;chalar
              </h2>
              <img src={RocketIcon} alt="" className="h-10 w-10 md:h-12 md:w-12" width={48} height={48} />
            </div>
            <p className="mt-3 max-w-xl text-sm text-white/55 md:text-base">
              Ota-onalar va mutaxassislar baholagan eng yaxshi bog&apos;chalardan tanlang — 10 ta top tanlov.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/search')}
            className="btn-primary shrink-0 self-start sm:self-auto !px-8 !py-3 !text-sm"
          >
            Barchasi
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Curved carousel or empty / error */}
        <div
          className="relative"
          style={
            !loading && kindergartens.length > 0
              ? { height: '480px', perspective: '1200px' }
              : { minHeight: loading ? '480px' : '320px' }
          }
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#d946ef]" aria-hidden />
              <span className="sr-only">Yuklanmoqda</span>
            </div>
          )}

          {!loading && fetchError && (
            <div className="flex min-h-[320px] items-center justify-center px-4 py-12">
              <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/[0.08] border-t-white/[0.14] bg-gradient-to-b from-white/[0.06] to-transparent px-8 py-10 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#d946ef]/10 via-transparent to-[#818cf8]/5" aria-hidden />
                <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#d946ef]">
                  <WifiOff className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="relative z-10 text-xl font-black tracking-tight text-white md:text-2xl">
                  Ma&apos;lumot yuklanmadi
                </h3>
                <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55 md:text-base">
                  Server bilan bog&apos;lanishda muammo bo&apos;ldi. Internet aloqasini tekshirib, qayta urinib ko&apos;ring.
                </p>
                <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => loadTopKindergartens()}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-[#d946ef]/40 hover:bg-[#d946ef]/15"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden />
                    Qayta yuklash
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/search')}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#a855f7] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_-4px_rgba(217,70,239,0.45)] transition-transform hover:scale-[1.02]"
                  >
                    Qidiruvga o&apos;tish
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !fetchError && kindergartens.length === 0 && (
            <div className="flex min-h-[320px] items-center justify-center px-4 py-12">
              <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/[0.08] border-t-white/[0.14] bg-gradient-to-b from-white/[0.06] to-transparent px-8 py-10 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#818cf8]/8 via-transparent to-[#d946ef]/8" aria-hidden />
                <div className="relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
                  <Building2 className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="relative z-10 text-xl font-black tracking-tight text-white md:text-2xl">
                  Hozircha ro&apos;yxat bo&apos;sh
                </h3>
                <p className="relative z-10 mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55 md:text-base">
                  Hozircha top bog&apos;chalar ro&apos;yxati bo&apos;sh. Barcha bog&apos;chalarni qidiruv orqali ko&apos;rishingiz mumkin.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/search')}
                  className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#a855f7] px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-4px_rgba(217,70,239,0.45)] transition-transform hover:scale-[1.02]"
                >
                  Bog&apos;chalarni qidirish
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          )}

          {!loading && kindergartens.length > 0 && (
            <>
              <div
                className="relative flex h-full w-full items-center justify-center opacity-100 transition-opacity"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {kindergartens.map((kg, index) => (
                  <div
                    key={kg.id ?? `kg-${index}`}
                    style={getCardStyle(index)}
                    className="group w-[280px] cursor-pointer"
                    onClick={() => handleCardClick(kg, index)}
                  >
                    <div className={`relative overflow-hidden rounded-[32px] border border-white/[0.08] border-t-white/[0.15] bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-2xl transition-all duration-500 ${index === activeIndex ? 'border-[#d946ef]/60 shadow-[0_8px_32px_rgba(217,70,239,0.25)]' : 'hover:border-white/[0.15] hover:bg-white/[0.05]'}`}>
                      {index === activeIndex && (
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#d946ef]/10 to-transparent" />
                      )}

                      <div className="relative z-10 px-5 pb-4 pt-5">
                        <h3 className="truncate text-xl font-black tracking-tight text-white drop-shadow-sm">
                          {kg.name}
                        </h3>
                      </div>

                      <div className="relative z-10 px-4">
                        <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-[20px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent transition-colors group-hover:border-white/10">
                          <img
                            src={kg.profilePhoto || Logo}
                            alt={kg.name}
                            className={`h-full w-full rounded-[20px] transition-transform duration-700 ${kg.profilePhoto ? 'object-cover group-hover:scale-105' : 'object-contain p-8 opacity-40 group-hover:scale-105 group-hover:opacity-50'}`}
                            onError={(e) => {
                              e.target.src = Logo
                              e.target.className = 'h-full w-full rounded-[20px] object-contain p-8 opacity-40 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-50'
                            }}
                          />
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090318]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </div>

                      <div className="relative z-10 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white/90">{kg.location || 'Toshkent shaxri'}</p>
                            <p className="mt-0.5 truncate text-xs text-white/50">{kg.district?.districtName || kg.districtName || 'Tuman'}</p>
                            {(kg.score != null && kg.score !== '') || (kg.rating != null && kg.rating !== '') ? (
                              <div className="mt-3 flex w-fit items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 backdrop-blur-md">
                                <div className="flex items-center gap-0.5">
                                  {renderStars(kg.score ?? kg.rating)}
                                </div>
                                {formatRating(kg) != null && (
                                  <span className="ml-1 text-xs font-bold text-white/80">{formatRating(kg)}</span>
                                )}
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${index === activeIndex ? 'bg-[#d946ef] text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:bg-[#c038d4]' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                          >
                            <MapPin className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {kindergartens.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all hover:bg-[#d946ef]/20 md:left-8"
                    aria-label="Oldingi"
                  >
                    <ChevronLeft size={24} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all hover:bg-[#d946ef]/20 md:right-8"
                    aria-label="Keyingi"
                  >
                    <ChevronRight size={24} aria-hidden />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {!loading && kindergartens.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {kindergartens.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex
                  ? 'w-6 bg-[#d946ef] shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                aria-label={`${index + 1}-chi element`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TopBogchalar
