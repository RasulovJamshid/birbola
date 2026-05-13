'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Star, MapPin, Clock, Phone, Globe, Users, BookOpen,
  Heart, Loader2, Calendar, Utensils, Share2, CheckCircle2,
  ImageIcon, Navigation, X, Waves, Moon, MessageSquare, Sparkles,
  Gamepad2, Stethoscope, Check
} from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import KindergartenCard from './KindergartenCard'
import dynamic from 'next/dynamic'

// Dynamically import the Map component to avoid SSR issues with Leaflet
const KindergartenMap = dynamic(() => import('./KindergartenMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1a3e] animate-pulse flex items-center justify-center text-white/20">
      <MapPin size={32} />
    </div>
  )
})

// Assets now served from public folder
const Logo = '/assets/birbola.svg'
import {
  getKindergartenById,
  getReviews,
  getKindergartenGroups,
  getKindergartens,
  createReview,
  likeReview,
  Features,
  LanguagesEnum,
  WorkingDaysOfWeek,
  Meals
} from '../services/api'

// Feature labels & Icons mapping
const featureConfig = {
  [Features.POOL]: { label: 'Basseyn', icon: Waves },
  [Features.MOSQUE]: { label: 'Masjid', icon: Moon },
  [Features.LOGOPED]: { label: 'Logoped', icon: MessageSquare },
  [Features.MASSAGE]: { label: 'Massaj', icon: Sparkles },
  [Features.PLAYGROUND]: { label: "O'yin maydoni", icon: Gamepad2 },
  [Features.MEDICAL]: { label: 'Tibbiy xizmat', icon: Stethoscope }
}

const languageLabels = {
  [LanguagesEnum.UZBEK]: "O'zbek",
  [LanguagesEnum.RUSSIAN]: 'Rus',
  [LanguagesEnum.ENGLISH]: 'Ingliz',
  [LanguagesEnum.ARABIC]: 'Arab',
  [LanguagesEnum.KOREAN]: 'Koreys',
  [LanguagesEnum.CHINESE]: 'Xitoy',
  [LanguagesEnum.TURKISH]: 'Turk'
}

const workingDaysLabels = {
  [WorkingDaysOfWeek.MONDAY]: 'Du',
  [WorkingDaysOfWeek.TUESDAY]: 'Se',
  [WorkingDaysOfWeek.WEDNESDAY]: 'Ch',
  [WorkingDaysOfWeek.THURSDAY]: 'Pa',
  [WorkingDaysOfWeek.FRIDAY]: 'Ju',
  [WorkingDaysOfWeek.SATURDAY]: 'Sha',
  [WorkingDaysOfWeek.SUNDAY]: 'Ya'
}

const mealsLabels = {
  [Meals.NONE]: 'Ovqatsiz',
  [Meals.BREAKFAST]: 'Nonushta',
  [Meals.LUNCH]: 'Tushlik',
  [Meals.DINNER]: 'Kechki ovqat',
  [Meals.FULL]: "To'liq ovqat"
}

const KindergartenDetail = ({ id }) => {
  const router = useRouter()

  const [kindergarten, setKindergarten] = useState(null)
  const [reviews, setReviews] = useState([])
  const [groups, setGroups] = useState([])
  const [similarKindergartens, setSimilarKindergartens] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    commentText: '',
    score: 5
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSubmitError, setReviewSubmitError] = useState('')

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [shareHint, setShareHint] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [kgData, reviewsData, groupsData] = await Promise.all([
          getKindergartenById(id),
          getReviews(id).catch(() => []),
          getKindergartenGroups(id).catch(() => [])
        ])

        setKindergarten(kgData)
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData?.data || [])
        setGroups(Array.isArray(groupsData) ? groupsData : groupsData?.data || [])

        // Fetch similar kindergartens based on district
        if (kgData?.district?.id || kgData?.districtId) {
          const districtId = kgData.district?.id || kgData.districtId
          const similarData = await getKindergartens({
            districtId: [districtId],
            pageSize: 4
          }).catch(() => null)

          if (similarData?.data) {
            setSimilarKindergartens(
              similarData.data.filter(k => k.id !== kgData.id).slice(0, 3)
            )
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      window.scrollTo(0, 0)
      fetchData()
    }
  }, [id])

  const reviewStats = useMemo(() => {
    if (!reviews.length) return null
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const score = Math.round(r.score || 5)
      if (distribution[score] !== undefined) distribution[score]++
    })
    return {
      average: reviews.reduce((acc, r) => acc + (r.score || 0), 0) / reviews.length,
      total: reviews.length,
      distribution
    }
  }, [reviews])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewSubmitError('')
    setSubmittingReview(true)

    try {
      await createReview({
        kinderGartenId: parseInt(id),
        ...reviewForm,
        authorId: crypto.randomUUID()
      })

      const newReviews = await getReviews(id)
      setReviews(Array.isArray(newReviews) ? newReviews : newReviews?.data || [])
      setReviewForm({ authorName: '', commentText: '', score: 5 })
      setReviewSubmitError('')
      setShowReviewForm(false)
    } catch (err) {
      console.error('Error submitting review:', err)
      setReviewSubmitError("Yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleLikeReview = async (reviewId) => {
    try {
      await likeReview(reviewId, true)
      // Optimistic update could be added here
      const newReviews = await getReviews(id)
      setReviews(Array.isArray(newReviews) ? newReviews : newReviews?.data || [])
    } catch (err) { console.error(err) }
  }

  const renderStars = (rating, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? 'text-[#d946ef] fill-[#d946ef]' : 'text-gray-600'}`}
      />
    ))
  }

  const formatPrice = (price) => {
    if (!price) return "Ko'rsatilmagan"
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
  }

  const formatTime = (timeObj) => {
    if (!timeObj) return '';
    if (typeof timeObj === 'string') return timeObj;
    const h = timeObj.hour?.toString().padStart(2, '0') || '00';
    const m = timeObj.minute?.toString().padStart(2, '0') || '00';
    return `${h}:${m}`;
  }

  const goBack = () => {
    if (typeof window === 'undefined') {
      router.push('/search')
      return
    }
    if (window.history.length > 1) router.back()
    else router.push('/search')
  }

  const handleShare = async () => {
    if (!kindergarten) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = kindergarten.name
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url })
        setShareHint('shared')
        setTimeout(() => setShareHint(null), 2000)
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareHint('copied')
      setTimeout(() => setShareHint(null), 2000)
    } catch {
      setShareHint('fail')
      setTimeout(() => setShareHint(null), 2500)
    }
  }

  if (loading) {
    return (
      <div className="kg-detail-shell flex min-h-screen flex-col items-center justify-center bg-[#090318] px-4 pt-11 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#d946ef]" aria-hidden />
        <p className="mt-4 text-sm text-white/50">Ma&apos;lumot yuklanmoqda…</p>
      </div>
    )
  }

  if (error || !kindergarten) {
    return (
      <div className="kg-detail-shell flex min-h-screen flex-col items-center justify-center bg-[#090318] px-4 pt-11 text-center text-white">
        <p className="mb-2 text-lg text-gray-400">Ma&apos;lumot topilmadi</p>
        <p className="mb-6 max-w-sm text-sm text-white/40">Bog&apos;cha o&apos;chirilgan yoki havola noto&apos;g&apos;ri bo&apos;lishi mumkin.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/search')}
            className="rounded-2xl bg-[#d946ef] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#d946ef]/20 transition-opacity hover:opacity-90"
          >
            Qidiruvga o&apos;tish
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
          >
            Bosh sahifa
          </button>
        </div>
      </div>
    )
  }

  // Hero Parallax Style
  const heroStyle = {
    transform: `translateY(${scrollY * 0.4}px)`,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ChildCare',
    name: kindergarten.name,
    description: kindergarten.description || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: kindergarten.address || undefined,
      addressLocality: kindergarten.districtName || kindergarten.district?.districtName || 'Toshkent',
      addressCountry: 'UZ',
    },
    telephone: kindergarten.phoneNumber || undefined,
    geo: kindergarten.latitude && kindergarten.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: kindergarten.latitude,
      longitude: kindergarten.longitude,
    } : undefined,
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: kindergarten.score?.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    image: kindergarten.profilePhoto || undefined,
    url: `https://birbola.uz/kindergarten/${kindergarten.id}`,
  }

  return (
    <div className="kg-detail-shell min-h-screen bg-[#090318] pb-24 font-sans selection:bg-[#d946ef]/30 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header
        className="fixed top-0 left-0 right-0 z-50"
        compact
        hideOnScroll
        enableSticky={false}
        isTransparentInitially={false}
        onScrollHideChange={setHeaderVisible}
      />

      <div
        className={`kg-sticky-subnav sticky z-40 transition-all duration-300 ${!headerVisible ? 'kg-sticky-subnav--lifted' : ''} ${isScrolled ? 'border-b border-white/5 bg-[#090318]/90 shadow-lg backdrop-blur-xl' : 'border-b border-transparent bg-transparent'}`}
      >
        <div className="relative mx-auto max-w-7xl px-3 py-2 sm:px-5 sm:py-2.5 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#d946ef] hover:bg-[#d946ef] hover:text-white"
              aria-label="Orqaga"
            >
              <ChevronLeft size={18} />
            </button>

            <p
              className={`min-w-0 flex-1 truncate text-center text-sm font-bold text-white transition-opacity duration-300 sm:text-base ${isScrolled ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              role="status"
            >
              {kindergarten.name}
            </p>

            <button
              type="button"
              onClick={handleShare}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#d946ef]/50 hover:text-[#d946ef]"
              aria-label="Ulashish"
            >
              {shareHint === 'copied' || shareHint === 'shared' ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-7">

            {/* Immersive Hero Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-2xl backdrop-blur-xl sm:rounded-[2rem]">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f0a1f] via-[#0f0a1f]/40 to-transparent" />
              <div
                className="relative h-[18rem] cursor-pointer overflow-hidden sm:h-[22rem] lg:h-[26rem]"
                onClick={() => setLightboxOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setLightboxOpen(true)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Rasmni kattalashtirish"
              >
                <img
                  style={heroStyle}
                  src={kindergarten.profilePhoto || Logo}
                  alt={kindergarten.name}
                  className={`w-full h-full will-change-transform ${kindergarten.profilePhoto ? 'object-cover' : 'object-contain p-20 opacity-30'} transition-transform duration-[0.1s]`}
                  onError={(e) => {
                    e.target.src = Logo
                    e.target.className = "w-full h-full object-contain p-20 opacity-30"
                  }}
                />
                <div className="absolute top-6 right-6 z-20 flex gap-2">
                  <span className="bg-black/40 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 flex items-center gap-1.5 hover:bg-black/60 transition-colors">
                    <ImageIcon size={14} /> Galereya
                  </span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 lg:p-8">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {kindergarten.isPremium && (
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-orange-500/20">PREMIUM</span>
                    )}
                    {kindergarten.meals !== undefined && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                        OVQAT: {mealsLabels[kindergarten.meals]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">{kindergarten.name}</h1>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-300">
                    <a href="#map" className="flex items-center gap-2 text-white/80 hover:text-[#d946ef] transition-colors">
                      <MapPin size={18} className="text-[#d946ef]" />
                      <span className="font-medium">{kindergarten.districtName || kindergarten.district?.districtName || 'Toshkent'}</span>
                    </a>
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-white">{kindergarten.score?.toFixed(1) || '5.0'}</span>
                      <span className="text-sm text-gray-500">({reviews.length} sharh)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <nav className="-mx-3 flex items-center gap-1.5 overflow-x-auto px-3 pb-1 no-scrollbar sm:mx-0 sm:gap-2 sm:px-0" aria-label="Bog'cha bo'limlari">
              <div className="flex min-w-0 gap-1.5 sm:gap-2" role="tablist">
              {[
                { id: 'info', label: "Ma'lumot", icon: BookOpen },
                { id: 'groups', label: `Guruhlar (${groups.length})`, icon: Users },
                { id: 'reviews', label: `Sharhlar (${reviews.length})`, icon: Star }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`kg-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`kg-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm ${
                    activeTab === tab.id
                      ? 'border-[#d946ef] bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/25'
                      : 'border-white/5 bg-[#1a152e] text-gray-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <tab.icon size={16} aria-hidden />
                  {tab.label}
                </button>
              ))}
              </div>
            </nav>

            {/* Tab Content */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-7">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#d946ef]/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#ec4899]/5 rounded-full blur-[100px] pointer-events-none" />

              {/* Info Tab */}
              {activeTab === 'info' && (
                <div
                  id="kg-panel-info"
                  role="tabpanel"
                  aria-labelledby="kg-tab-info"
                  className="relative z-10 animate-fadeIn space-y-8 sm:space-y-10"
                >
                  {kindergarten.description && (
                    <div className="prose prose-invert max-w-none">
                      <h3 className="text-xl font-bold text-white mb-4">Bog'cha haqida</h3>
                      <p className="text-gray-400 leading-relaxed text-lg">{kindergarten.description}</p>
                    </div>
                  )}

                  {kindergarten.features?.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Qulayliklar</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {kindergarten.features.map(feature => {
                          const conf = featureConfig[feature] || { label: 'Feature', icon: Star }
                          const Icon = conf.icon
                          return (
                            <div key={feature} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#d946ef]/30 transition-colors group">
                              <div className="w-10 h-10 rounded-xl bg-[#d946ef]/10 flex items-center justify-center group-hover:bg-[#d946ef] transition-all duration-300 group-hover:scale-110">
                                {Icon && (typeof Icon === 'function' || typeof Icon === 'object') ? (
                                  <Icon size={20} className="text-[#d946ef] group-hover:text-white transition-colors" />
                                ) : (
                                  <span className="text-xl">{Icon}</span>
                                )}
                              </div>
                              <span className="text-gray-300 font-medium text-sm group-hover:text-white transition-colors">{conf.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-[#d946ef]" /> Ta'lim tillari
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {kindergarten.languageGroups?.map(lang => (
                          <span key={lang} className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                            {languageLabels[lang] || lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-[#d946ef]" /> Ish kunlari
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(workingDaysLabels).map(([key, label]) => (
                          <div key={key} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${kindergarten.workingDaysInWeek?.includes(parseInt(key))
                            ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/20'
                            : 'bg-white/5 border border-white/5 text-gray-600 opacity-50'
                            }`}>
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Groups Tab */}
              {activeTab === 'groups' && (
                <div
                  id="kg-panel-groups"
                  role="tabpanel"
                  aria-labelledby="kg-tab-groups"
                  className="relative z-10 animate-fadeIn"
                >
                  {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Users size={48} className="mb-4 opacity-50 stroke-1" />
                      <p className="text-lg font-medium">Guruhlar haqida ma'lumot yo'q</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groups.map(group => (
                        <div key={group.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-[#d946ef]/30 transition-all hover:bg-white/10 group">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#d946ef]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#d946ef] transition-colors">
                              <Users className="w-6 h-6 text-[#d946ef] group-hover:text-white transition-colors" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">{group.name || 'Guruh'}</h4>
                              <p className="text-sm text-gray-400 font-medium">{group.ageRange || 'Yosh chegarasi'}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-xl">
                              <span className="text-gray-400">Sig'im</span>
                              <span className="text-white font-bold">{group.capacity} bola</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-3 bg-black/20 rounded-xl">
                              <span className="text-gray-400">Bo'sh o'rinlar</span>
                              <span className="text-[#d946ef] font-bold">{(group.capacity || 0) - (group.currentCount || 0)} ta</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div
                  id="kg-panel-reviews"
                  role="tabpanel"
                  aria-labelledby="kg-tab-reviews"
                  className="relative z-10 animate-fadeIn space-y-6 sm:space-y-8"
                >

                  {/* Reviews Summary */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="text-center md:text-left">
                        <div className="text-5xl font-extrabold text-white mb-2">{reviewStats ? reviewStats.average.toFixed(1) : '0.0'}</div>
                        <div className="flex gap-1 justify-center md:justify-start mb-2">
                          {renderStars(Math.round(reviewStats?.average || 0))}
                        </div>
                        <p className="text-gray-400 text-sm whitespace-nowrap">{reviews.length} ta sharh</p>
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        {[5, 4, 3, 2, 1].map(score => {
                          const count = reviewStats?.distribution[score] || 0
                          const percent = reviewStats?.total ? (count / reviewStats.total) * 100 : 0
                          return (
                            <div key={score} className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 w-12 text-white font-bold">{score} <Star size={10} className="fill-white" /></span>
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#d946ef] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="w-8 text-right text-gray-500">{percent.toFixed(0)}%</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewSubmitError('')
                            setShowReviewForm(!showReviewForm)
                          }}
                          className="w-full md:w-auto px-6 py-3 bg-[#d946ef] text-white rounded-xl font-bold shadow-lg shadow-[#d946ef]/20 hover:scale-105 transition-transform"
                        >
                          Sharh yozish
                        </button>
                      </div>
                    </div>
                  </div>

                  {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="animate-fadeIn rounded-2xl border border-white/10 bg-[#1a152e] p-5 sm:p-6">
                      <h4 className="mb-3 text-base font-bold text-white sm:text-lg">Sizning fikringiz</h4>
                      {reviewSubmitError ? (
                        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{reviewSubmitError}</p>
                      ) : null}
                      <div className="space-y-4">
                        <input
                          type="text"
                          required
                          value={reviewForm.authorName}
                          onChange={e => setReviewForm(prev => ({ ...prev, authorName: e.target.value }))}
                          placeholder="Ismingiz"
                          className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#d946ef] transition-colors"
                        />
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, score }))}
                              className={`p-2 rounded-lg transition-colors ${reviewForm.score >= score ? 'bg-[#d946ef]/20 text-[#d946ef]' : 'bg-white/5 text-gray-500'}`}
                            >
                              <Star className={`w-6 h-6 ${reviewForm.score >= score ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          required
                          value={reviewForm.commentText}
                          onChange={e => setReviewForm(prev => ({ ...prev, commentText: e.target.value }))}
                          placeholder="Sharhingiz..."
                          className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#d946ef] transition-colors min-h-[100px] resize-none"
                        />
                        <button disabled={submittingReview} type="submit" className="w-full py-3 bg-[#d946ef] text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                          {submittingReview ? 'Yuborilmoqda...' : 'Yuborish'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d946ef] to-purple-600 flex items-center justify-center text-white font-bold">
                              {review.authorName?.[0] || 'U'}
                            </div>
                            <div>
                              <h5 className="font-bold text-white">{review.authorName}</h5>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="flex text-[#d946ef]">{renderStars(review.score || 5, 'w-3 h-3')}</div>
                                <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleLikeReview(review.id)}
                            className="flex items-center gap-1 text-gray-500 transition-colors hover:text-red-500"
                          >
                            <Heart size={16} /> <span className="text-xs">{review.likes || 0}</span>
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{review.commentText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Similar Kindergartens */}
            {similarKindergartens.length > 0 && (
              <div className="pt-6 lg:pt-7">
                <h3 className="mb-4 text-xl font-bold text-white sm:text-2xl">O&apos;xshash bog&apos;chalar</h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
                  {similarKindergartens.map(kg => (
                    <KindergartenCard key={kg.id} kg={kg} onClick={() => router.push(`/kindergarten/${kg.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div
            className={`kg-detail-sidebar space-y-5 lg:sticky lg:col-span-4 lg:self-start ${!headerVisible ? 'kg-sticky-subnav--lifted' : ''}`}
          >

            {/* Price Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#d946ef]/20 bg-gradient-to-br from-[#d946ef]/20 to-[#ec4899]/10 p-6 text-white shadow-2xl shadow-[#d946ef]/10 backdrop-blur-xl sm:rounded-[2rem] sm:p-7">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#d946ef]/10 rounded-full blur-3xl" />
              <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-[#ec4899]/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <p className="text-[#d946ef] font-bold text-xs tracking-wider uppercase mb-2">Oylik to'lov</p>
                <p className="text-4xl font-extrabold mb-1 text-white">{formatPrice(kindergarten.price)}</p>
                <p className="text-gray-400 text-sm mb-6">Sifatli ta'lim uchun</p>
                <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d946ef] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#d946ef]/30 transition-transform active:scale-[0.99] sm:rounded-2xl sm:py-4">
                  <CheckCircle2 size={18} aria-hidden /> Ariza qoldirish
                </button>
                <p className="text-center text-white/50 text-xs mt-4 font-medium">Xavfsiz va tezkor ro'yxatga olish</p>
              </div>
            </div>

            {/* Info Card */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white sm:text-lg">
                <span className="w-3 h-3 rounded-full bg-[#d946ef]" /> Asosiy ma'lumot
              </h3>
              {[
                { icon: Phone, label: "Telefon", value: kindergarten.phoneNumber, href: `tel:${kindergarten.phoneNumber}` },
                { icon: MapPin, label: "Manzil", value: kindergarten.address, id: "map" },
                { icon: Clock, label: "Ish vaqti", value: `${formatTime(kindergarten.workingStartHour)} - ${formatTime(kindergarten.workingEndHour)}` },
                { icon: Utensils, label: "Ovqatlanish", value: mealsLabels[kindergarten.meals] || "Mavjud emas" }
              ].map((item, i) => item.value && (
                <div key={i} className="flex items-start gap-4 group pb-4 border-b border-white/5 last:pb-0 last:border-b-0 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#d946ef]/10 flex items-center justify-center text-[#d946ef] group-hover:bg-[#d946ef]/20 transition-all flex-shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white font-medium hover:text-[#d946ef] transition-colors truncate block">{item.value}</a>
                    ) : (
                      <p className="text-gray-300 font-medium break-words leading-snug">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="group relative h-60 overflow-hidden rounded-2xl border border-white/10 bg-[#1a152e] p-1.5 transition-transform hover:scale-[1.01] hover:shadow-2xl hover:shadow-[#d946ef]/10 sm:h-72 sm:rounded-[2rem] sm:p-2">
              <div id="map" className="relative z-0 h-full w-full overflow-hidden rounded-[1.25rem] bg-[#0f0a1f] sm:rounded-[2rem]">
                <KindergartenMap
                  lat={kindergarten.latitude || 41.2995}
                  lng={kindergarten.longitude || 69.2401}
                  name={kindergarten.name}
                  address={kindergarten.address}
                />
              </div>
            </div>

            {kindergarten.latitude != null && kindergarten.longitude != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${kindergarten.latitude},${kindergarten.longitude}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <Navigation size={18} aria-hidden /> Marshrut (Google xarita)
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a152e]/90 p-3 backdrop-blur-xl pb-safe lg:hidden">
        <div className="mx-auto flex max-w-lg gap-3">
          {kindergarten.phoneNumber ? (
            <a
              href={`tel:${kindergarten.phoneNumber}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[0.99]"
            >
              <Phone size={18} aria-hidden /> Qo&apos;ng&apos;iroq
            </a>
          ) : (
            <span className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/35">
              <Phone size={18} aria-hidden /> Telefon yo&apos;q
            </span>
          )}
          <button
            type="button"
            className="flex-[1.4] rounded-xl bg-[#d946ef] py-3 text-sm font-bold text-white shadow-lg shadow-[#d946ef]/20 transition-transform active:scale-[0.99]"
          >
            Ariza qoldirish
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex animate-fadeIn items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-[1] rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(false)
            }}
            aria-label="Yopish"
          >
            <X size={28} />
          </button>
          <img
            src={kindergarten.profilePhoto || Logo}
            alt={kindergarten.name}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  )
}

export default KindergartenDetail
