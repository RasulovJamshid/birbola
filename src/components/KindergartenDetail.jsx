'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Star, MapPin, Clock, Phone, Globe, Users, BookOpen,
  Heart, Send, Loader2, Calendar, Utensils, Share2, CheckCircle2,
  ImageIcon, Navigation, X, Waves, Moon, MessageSquare, Sparkles,
  Gamepad2, Stethoscope
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

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      setShowReviewForm(false)
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Xatolik yuz berdi')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0a1f] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#d946ef] animate-spin" />
      </div>
    )
  }

  if (error || !kindergarten) {
    return (
      <div className="min-h-screen bg-[#0f0a1f] flex flex-col items-center justify-center text-white p-4 text-center">
        <p className="text-xl mb-4 text-gray-400">Ma'lumot topilmadi</p>
        <button
          onClick={() => router.push('/search')}
          className="px-8 py-3 bg-[#d946ef] text-white rounded-2xl hover:opacity-90 font-bold shadow-lg shadow-[#d946ef]/20 transition-all"
        >
          Qidiruvga qaytish
        </button>
      </div>
    )
  }

  // Hero Parallax Style
  const heroStyle = {
    transform: `translateY(${scrollY * 0.4}px)`,
  }

  return (
    <div className="min-h-screen bg-[#0f0a1f] selection:bg-[#d946ef]/30 font-sans pb-24 lg:pb-0">
      <Header className="relative" />

      {/* Sticky Top Bar & Navigation */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-[#0f0a1f]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#d946ef] hover:border-[#d946ef] transition-all flex-shrink-0"
            >
              <ChevronLeft size={20} />
            </button>

            <h1 className={`text-lg font-bold text-white truncate text-center flex-1 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}>
              {kindergarten.name}
            </h1>

            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d946ef] hover:border-[#d946ef]/50 transition-all flex-shrink-0">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Immersive Hero Card */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-[#1a152e] border border-white/10 group shadow-2xl">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f0a1f] via-[#0f0a1f]/40 to-transparent" />
              <div className="relative h-[28rem] sm:h-[32rem] overflow-hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
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

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 transform translate-y-0 transition-transform">
                <div className="space-y-4">
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

                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">{kindergarten.name}</h1>

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

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { id: 'info', label: "Ma'lumot", icon: BookOpen },
                { id: 'groups', label: `Guruhlar (${groups.length})`, icon: Users },
                { id: 'reviews', label: `Sharhlar (${reviews.length})`, icon: Star }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all border ${activeTab === tab.id
                    ? 'bg-[#d946ef] text-white border-[#d946ef] shadow-lg shadow-[#d946ef]/25'
                    : 'bg-[#1a152e] text-gray-400 border-white/5 hover:text-white hover:border-white/10'
                    }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#1a152e] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d946ef]/5 rounded-full blur-[80px] pointer-events-none" />

              {/* Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-10 animate-fadeIn relative z-10">
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
                <div className="animate-fadeIn relative z-10">
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
                <div className="animate-fadeIn space-y-8 relative z-10">

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
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="w-full md:w-auto px-6 py-3 bg-[#d946ef] text-white rounded-xl font-bold shadow-lg shadow-[#d946ef]/20 hover:scale-105 transition-transform"
                        >
                          Sharh yozish
                        </button>
                      </div>
                    </div>
                  </div>

                  {showReviewForm && (
                    <form onSubmit={handleSubmitReview} className="bg-[#1a152e] border border-white/10 rounded-2xl p-6 animate-fadeIn">
                      <h4 className="text-lg font-bold text-white mb-4">Sizning fikringiz</h4>
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
                          <button onClick={() => handleLikeReview(review.id)} className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
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
              <div className="pt-8">
                <h3 className="text-2xl font-bold text-white mb-6">O'xshash bog'chalar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarKindergartens.map(kg => (
                    <KindergartenCard key={kg.id} kg={kg} onClick={() => router.push(`/kindergarten/${kg.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* Price Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#d946ef] to-[#ec4899] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#d946ef]/20">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <p className="text-white/80 font-bold text-xs tracking-wider uppercase mb-1">Oylik to'lov</p>
                <p className="text-3xl font-extrabold mb-6">{formatPrice(kindergarten.price)}</p>
                <button className="w-full py-4 bg-white text-[#d946ef] rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} /> Ariza qoldirish
                </button>
                <p className="text-center text-white/60 text-xs mt-3 font-medium">To'lovlar xavfsiz himoyalangan</p>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-[#1a152e] rounded-[2.5rem] p-8 border border-white/10 space-y-6">
              {[
                { icon: Phone, label: "Telefon", value: kindergarten.phoneNumber, href: `tel:${kindergarten.phoneNumber}` },
                { icon: MapPin, label: "Manzil", value: kindergarten.address, id: "map" },
                { icon: Clock, label: "Ish vaqti", value: `${formatTime(kindergarten.workingStartHour)} - ${formatTime(kindergarten.workingEndHour)}` },
                { icon: Utensils, label: "Ovqatlanish", value: mealsLabels[kindergarten.meals] || "Mavjud emas" }
              ].map((item, i) => item.value && (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#d946ef] group-hover:bg-[#d946ef]/10 transition-all flex-shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white font-medium hover:text-[#d946ef] transition-colors truncate block">{item.value}</a>
                    ) : (
                      <p className="text-white font-medium break-words leading-snug">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-[#1a152e] rounded-[2.5rem] p-2 border border-white/10 overflow-hidden h-72 relative group transition-all transform hover:scale-[1.01] hover:shadow-2xl hover:shadow-[#d946ef]/10">
              <div className="w-full h-full rounded-[2rem] bg-[#0f0a1f] relative overflow-hidden z-0">
                <KindergartenMap
                  lat={kindergarten.latitude || 41.2995}
                  lng={kindergarten.longitude || 69.2401}
                  name={kindergarten.name}
                  address={kindergarten.address}
                />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a152e]/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 pb-safe">
        <div className="flex gap-4 max-w-lg mx-auto">
          <a href={`tel:${kindergarten.phoneNumber}`} className="flex-1 py-3.5 bg-white/5 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all">
            <Phone size={18} /> Qo'ng'iroq
          </a>
          <button className="flex-[2] py-3.5 bg-[#d946ef] text-white rounded-xl font-bold shadow-lg shadow-[#d946ef]/20 active:scale-95 transition-all">
            Ariza qoldirish
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2">
            <X size={32} />
          </button>
          <img
            src={kindergarten.profilePhoto || Logo}
            alt={kindergarten.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      <Footer />
    </div>
  )
}

export default KindergartenDetail
