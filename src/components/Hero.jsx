'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  X,
  Loader2,
  Search,
  ArrowRight,
  ChevronDown,
  UtensilsCrossed,
  Palette,
  UserCheck,
  Bus,
  MessageCircle,
  CalendarDays,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { getKindergartens } from '../services/api'

const Logo = '/assets/birbola.svg'

const CYCLING_WORDS = ['kelajakka', 'muvaffaqiyatga', 'baxtga', 'ta\'limga']

/** Width baseline so the headline line does not resize when the word swaps */
const LONGEST_CYCLING_WORD = CYCLING_WORDS.reduce((a, b) =>
  a.length >= b.length ? a : b
)

/** Decorative notification stack — SVG icons, copy, action chips; auto-cycles unless reduced motion */
const HERO_LIVE_CARDS = [
  {
    Icon: UtensilsCrossed,
    iconTone: 'meal',
    category: 'Ovqatlanish',
    title: 'Alisher sog‘lom tushlikni yakunladi',
    detail: 'Menyu: sabzavotli sho‘rva, tovuq kotleti, salat.',
    time: 'Hozirgina',
    actions: [{ label: 'Tafsilot', primary: true }, { label: 'Haftalik menyu' }],
  },
  {
    Icon: Palette,
    iconTone: 'art',
    category: 'Galereya',
    title: 'Yangi ijodiy ishlar yuklandi',
    detail: '“Ranglar olami” darsi — 6 ta rasm albomingizga qo‘shildi.',
    time: '2 daq oldin',
    actions: [{ label: 'Ko‘rish', primary: true }, { label: 'Ulashish' }],
  },
  {
    Icon: UserCheck,
    iconTone: 'checkin',
    category: 'Kelish',
    title: 'Kelish tasdiqlandi',
    detail: 'Farzandingiz bog‘chaga kirdi — javobgar: otasi.',
    time: '5 daq oldin',
    actions: [{ label: 'Bugungi tarix', primary: true }],
  },
  {
    Icon: Bus,
    iconTone: 'bus',
    category: 'Olib ketish',
    title: 'Eslatma: bugun 17:00 da olib ketish',
    detail: 'Kechikish bo‘lsa, bog‘chaga xabar qiling — xavfsizlik uchun.',
    time: '12 daq oldin',
    actions: [{ label: 'Tasdiqlash', primary: true }, { label: 'Vaqt o‘zgartirish' }],
  },
  {
    Icon: MessageCircle,
    iconTone: 'msg',
    category: 'O‘qituvchi',
    title: 'Fotima opa yangi xabar qoldirdi',
    detail: 'Yakshanba ochiq eshik kuni va liboslar haqida qisqa eslatma.',
    time: '45 daq oldin',
    actions: [{ label: 'O‘qish', primary: true }, { label: 'Javob' }],
  },
  {
    Icon: CalendarDays,
    iconTone: 'plan',
    category: 'Haftalik reja',
    title: 'Keyingi darslar yangilandi',
    detail: 'Musiqa, jismoniy tarbiya, ingliz tili — vaqtlar jadvalda.',
    time: '1 soat oldin',
    actions: [{ label: 'To‘liq jadval', primary: true }, { label: 'Taqvimga qo‘shish' }],
  },
]

const NOTIFY_ADVANCE_MS = 3800

const Hero = () => {
  const router = useRouter()
  const heroRef = useRef(null)
  const notifyScrollRef = useRef(null)
  const notifyIndexRef = useRef(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [resultsModalOpen, setResultsModalOpen] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const interval = setInterval(() => {
      setWordVisible(false)
      setTimeout(() => {
        setWordIndex(i => (i + 1) % CYCLING_WORDS.length)
        setWordVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [reduceMotion])

  /** Auto-cycle notification cards (no user scroll); pause on hover / tab hidden */
  useEffect(() => {
    if (reduceMotion || !mounted) return
    const root = notifyScrollRef.current
    if (!root) return

    notifyIndexRef.current = 0
    root.scrollTop = 0

    const stack = root.closest('.hero-notify-stack')
    let hoverPause = false
    const onEnter = () => { hoverPause = true }
    const onLeave = () => { hoverPause = false }
    stack?.addEventListener('mouseenter', onEnter)
    stack?.addEventListener('mouseleave', onLeave)

    const tick = () => {
      if (document.visibilityState !== 'visible' || hoverPause) return
      const cards = Array.from(root.querySelectorAll(':scope > .hero-notify-card'))
      const halfLength = Math.floor(cards.length / 2)
      if (halfLength < 1) return

      notifyIndexRef.current += 1
      const isLoopPoint = notifyIndexRef.current === halfLength

      const card = cards[notifyIndexRef.current]
      if (!card) {
        notifyIndexRef.current = 0
        root.style.scrollBehavior = 'auto'
        root.scrollTop = 0
        return
      }

      const top = card.offsetTop - 12
      root.style.scrollBehavior = 'smooth'
      root.scrollTop = top

      if (isLoopPoint) {
        // Once we smoothly scroll to the first cloned card, silently snap back to the real first card
        setTimeout(() => {
          if (!notifyScrollRef.current) return
          notifyScrollRef.current.style.scrollBehavior = 'auto'
          notifyScrollRef.current.scrollTop = 0
          notifyIndexRef.current = 0
        }, 800)
      }
    }

    const id = window.setInterval(tick, NOTIFY_ADVANCE_MS)
    return () => {
      clearInterval(id)
      stack?.removeEventListener('mouseenter', onEnter)
      stack?.removeEventListener('mouseleave', onLeave)
    }
  }, [reduceMotion, mounted])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        setLoading(true)
        setResultsModalOpen(false)
        try {
          const response = await getKindergartens({ search: searchQuery, pageSize: 5, pageNumber: 1 }, { signal: controller.signal })
          if (!controller.signal.aborted) {
            const items = Array.isArray(response) ? response : response?.data || response?.items || []
            setResults(items)
            setShowResults(true)
            setResultsModalOpen(items.length > 0)
          }
        } catch (err) {
          if (err.name !== 'AbortError') console.error(err)
        } finally {
          if (!controller.signal.aborted) setLoading(false)
        }
      } else {
        setResults([])
        setShowResults(false)
        setLoading(false)
        setResultsModalOpen(false)
      }
    }, 500)
    return () => { clearTimeout(timer); controller.abort() }
  }, [searchQuery])

  useEffect(() => {
    if (!resultsModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setResultsModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resultsModalOpen])

  useEffect(() => {
    if (!resultsModalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [resultsModalOpen])

  const handleSearch = () => {
    router.push(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <section className="hero" ref={heroRef} id="hero" aria-labelledby="hero-heading">
      <div className="hero-bg-wrapper">
        <div className="hero-aurora" />
        <div className="hero-grid" />
        <div className="hero-glow glow-pink" />
      </div>

      <div className="hero-inner relative z-10">
        <div className={`hero-main ${mounted ? 'hero-main--visible' : ''}`}>
          <div className="hero-split">
            <div className="hero-copy">
              <div className="hero-badge" style={{ animationDelay: '0s' }}>
                <span className="hero-badge-dot" />
                O&apos;zbekistondagi #1 bog&apos;cha platformasi
              </div>

              <h1 id="hero-heading" className="hero-headline" style={{ animationDelay: '0.1s' }}>
                &ldquo;Bir bola&rdquo; bilan
                <br />
                <span className="hero-headline-stack">
                  <span className="hero-word-line">
                    <span className="hero-word-slot">
                      <span className="hero-word-slot-measure" aria-hidden="true">
                        {LONGEST_CYCLING_WORD}
                      </span>
                      <span
                        className={`hero-word-cycle ${wordVisible ? 'hero-word-cycle--in' : 'hero-word-cycle--out'}`}
                      >
                        {CYCLING_WORDS[wordIndex]}
                      </span>
                    </span>
                  </span>
                  <span className="hero-headline-plain">ilk qadam</span>
                </span>
              </h1>

              <p className="hero-subtitle" style={{ animationDelay: '0.18s' }}>
                Farzandingiz uchun eng yaxshi bog&apos;chani toping — minglab ota-onalar ishongan platforma.
              </p>

              <div className="hero-features" style={{ animationDelay: '0.22s' }}>
                <div className="hero-feature">
                  <CheckCircle2 className="hero-feature-icon" size={18} />
                  <span>10,000+ ota-onalar ishonchi</span>
                </div>
                <div className="hero-feature">
                  <CheckCircle2 className="hero-feature-icon" size={18} />
                  <span>Haqiqiy sharhlar va reytinglar</span>
                </div>
                <div className="hero-feature">
                  <CheckCircle2 className="hero-feature-icon" size={18} />
                  <span>100% bepul platforma</span>
                </div>
              </div>
            </div>

            <aside className="hero-aside" aria-label="Jonli yangilanishlar namoyishi" style={{ animationDelay: '0.26s' }}>
              <div className="hero-notify-header" aria-hidden="true">
                <div className="hero-notify-live-badge">
                  <span className="hero-notify-live-dot" /> Jonli efir
                </div>
                <h3 className="hero-notify-header-title">Ota-onalar ilovasi namunasi</h3>
              </div>
              <div className="hero-notify-stack">
                <div className="hero-notify-stack-glow" aria-hidden="true" />
                <div
                  ref={notifyScrollRef}
                  className={
                    reduceMotion
                      ? 'hero-notify-scroll custom-scrollbar'
                      : 'hero-notify-scroll hero-notify-scroll--auto'
                  }
                  role="region"
                  aria-label={
                    reduceMotion
                      ? 'Namunaviy bildirishnomalar'
                      : 'Namunaviy bildirishnomalar, avtomatik yangilanadi'
                  }
                  {...(reduceMotion ? { tabIndex: 0 } : {})}
                >
                {[...HERO_LIVE_CARDS, ...HERO_LIVE_CARDS].map((card, i) => {
                  const { Icon } = card
                  const originalIndex = i % HERO_LIVE_CARDS.length
                  return (
                    <div key={`${card.title}-${i}`} className={`hero-notify-card hero-notify-card--${originalIndex + 1}`}>
                      <div className="hero-notify-card-inner">
                        <div className={`hero-notify-icon-wrap hero-notify-icon-wrap--${card.iconTone}`} aria-hidden="true">
                          <Icon className="hero-notify-icon-svg" strokeWidth={2} size={22} />
                        </div>
                        <div className="hero-notify-content">
                          <div className="hero-notify-meta">
                            <span className="hero-notify-app">Birbola</span>
                            <span className="hero-notify-time">{card.time}</span>
                          </div>
                          <p className="hero-notify-category">{card.category}</p>
                          <p className="hero-notify-title">{card.title}</p>
                          <p className="hero-notify-detail">{card.detail}</p>
                          <div className="hero-notify-actions">
                            {card.actions.map((a) => (
                              <span
                                key={a.label}
                                className={a.primary ? 'hero-notify-action hero-notify-action--primary' : 'hero-notify-action'}
                              >
                                {a.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>
            </aside>
          </div>

          <div className="hero-search-row">
            <div className="hero-search-wrapper relative z-[60]">
              <div className="hero-search relative flex w-full items-center group focus-within:border-white/30 transition-colors">
                <span className="hero-search-icon relative" onClick={handleSearch} style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <Search size={22} className="text-white/40 group-focus-within:text-[#d946ef] transition-colors" />
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-[#d946ef] animate-pulse" />
                </span>
                <input
                  type="text"
                  placeholder="Bog'cha yoki manzilni AI yordamida qidiring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (results.length > 0 && showResults && !loading) setResultsModalOpen(true)
                  }}
                  className="bg-transparent text-white placeholder-white/30 focus:outline-none text-base sm:text-lg font-medium flex-1 ml-3"
                />
                
                {/* AI Badge */}
                {!searchQuery && !loading && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#d946ef]/15 to-[#818cf8]/15 border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider pointer-events-none flex-shrink-0 transition-opacity group-focus-within:opacity-0">
                    <Sparkles size={12} className="text-[#d946ef]" />
                    AI Izlash
                  </div>
                )}
                {loading && (
                  <span className="text-white/40 animate-spin ml-2 flex-shrink-0">
                    <Loader2 size={20} />
                  </span>
                )}
                {searchQuery && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setResults([])
                      setShowResults(false)
                      setResultsModalOpen(false)
                    }}
                    className="text-white/30 hover:text-white/80 transition-colors mx-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-full"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSearch}
                  className="hero-search-btn ml-1 sm:ml-2 !px-6 sm:!px-8 !py-2.5 sm:!py-3 text-sm sm:text-base"
                >
                  Izlash
                </button>
              </div>

              {/* No Results (inline, same as before) */}
              {showResults && results.length === 0 && !loading && searchQuery && (
                <div className="animate-fadeIn absolute left-0 right-0 top-full mt-3 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3 sm:gap-4 rounded-xl border border-white/10 bg-[#1a0b3b]/90 shadow-xl backdrop-blur-2xl text-left">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Search size={14} className="text-white/40" />
                  </div>
                  <p className="text-white/60 text-sm font-medium m-0 truncate">
                    &quot;{searchQuery}&quot; bo&apos;yicha natija topilmadi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!reduceMotion && (
        <div className="hero-scroll-indicator">
          <span className="hero-scroll-text">Pastga suring</span>
          <ChevronDown size={18} className="hero-scroll-arrow" />
        </div>
      )}

      {mounted &&
        resultsModalOpen &&
        results.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
              aria-label="Natijalarni yopish"
              onClick={() => setResultsModalOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hero-search-results-title"
              className="animate-fadeIn relative z-[1] flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a0b3b]/98 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-white/5 p-2 sm:p-3">
                <h2 id="hero-search-results-title" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-white/40 sm:ml-2 sm:text-xs">
                  Natijalar
                </h2>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="text-[10px] font-medium text-white/40 sm:text-xs">{results.length} ta topildi</span>
                  <button
                    type="button"
                    onClick={() => setResultsModalOpen(false)}
                    className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Yopish"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                {results.map((kg) => (
                  <button
                    key={kg.id}
                    type="button"
                    onClick={() => {
                      setResultsModalOpen(false)
                      router.push(`/kindergarten/${kg.id}`)
                    }}
                    className="group flex w-full cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#d946ef]/10 sm:gap-4 sm:px-5 sm:py-4"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-[#d946ef]/50 sm:h-14 sm:w-14">
                      <img
                        src={kg.profilePhoto || Logo}
                        alt={kg.name}
                        className={`h-full w-full ${kg.profilePhoto ? 'object-cover' : 'object-contain p-2 opacity-40 sm:p-3'}`}
                        onError={(e) => {
                          e.target.src = Logo
                          e.target.className = 'h-full w-full object-contain p-2 opacity-40 sm:p-3'
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-white transition-colors group-hover:text-[#d946ef] sm:text-lg">
                        {kg.name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-white/40 sm:mt-1 sm:text-sm">{kg.address || "Manzil ko'rsatilmagan"}</p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="flex-shrink-0 text-white/20 transition-all group-hover:translate-x-1 group-hover:text-[#d946ef]"
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setResultsModalOpen(false)
                  handleSearch()
                }}
                className="w-full shrink-0 border-t border-white/5 bg-[#d946ef]/10 py-3 text-xs font-black uppercase tracking-widest text-[#d946ef] transition-colors hover:bg-[#d946ef]/20 sm:py-4 sm:text-sm"
              >
                Barcha natijalarni ko&apos;rish
              </button>
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}

export default Hero
