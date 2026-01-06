import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Star, MapPin, Clock, Phone, Globe, Users, BookOpen, Heart, Send, Loader2, Calendar, Utensils } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import Logo from '../assets/birbola.svg'
import { 
  getKindergartenById, 
  getReviews, 
  getKindergartenGroups,
  createReview,
  likeReview,
  Features, 
  LanguagesEnum, 
  WorkingDaysOfWeek, 
  Meals 
} from '../services/api'

// Feature labels
const featureLabels = {
  [Features.POOL]: 'Basseyn',
  [Features.MOSQUE]: 'Masjid',
  [Features.LOGOPED]: 'Logoped',
  [Features.MASSAGE]: 'Massaj',
  [Features.PLAYGROUND]: "O'yin maydoni",
  [Features.MEDICAL]: 'Tibbiy xizmat'
}

// Feature icons
const featureIcons = {
  [Features.POOL]: '🏊',
  [Features.MOSQUE]: '🕌',
  [Features.LOGOPED]: '🗣️',
  [Features.MASSAGE]: '💆',
  [Features.PLAYGROUND]: '🎠',
  [Features.MEDICAL]: '🏥'
}

// Language labels
const languageLabels = {
  [LanguagesEnum.UZBEK]: "O'zbek tili",
  [LanguagesEnum.RUSSIAN]: 'Rus tili',
  [LanguagesEnum.ENGLISH]: 'Ingliz tili',
  [LanguagesEnum.ARABIC]: 'Arab tili',
  [LanguagesEnum.KOREAN]: 'Koreys tili',
  [LanguagesEnum.CHINESE]: 'Xitoy tili',
  [LanguagesEnum.TURKISH]: 'Turk tili'
}

// Working days labels
const workingDaysLabels = {
  [WorkingDaysOfWeek.MONDAY]: 'Dush',
  [WorkingDaysOfWeek.TUESDAY]: 'Sesh',
  [WorkingDaysOfWeek.WEDNESDAY]: 'Chor',
  [WorkingDaysOfWeek.THURSDAY]: 'Pay',
  [WorkingDaysOfWeek.FRIDAY]: 'Jum',
  [WorkingDaysOfWeek.SATURDAY]: 'Shan',
  [WorkingDaysOfWeek.SUNDAY]: 'Yak'
}

// Meals labels
const mealsLabels = {
  [Meals.NONE]: 'Ovqatsiz',
  [Meals.BREAKFAST]: 'Nonushta',
  [Meals.LUNCH]: 'Tushlik',
  [Meals.DINNER]: 'Kechki ovqat',
  [Meals.FULL]: "To'liq ovqat"
}

const KindergartenDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [kindergarten, setKindergarten] = useState(null)
  const [reviews, setReviews] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    commentText: '',
    score: 5
  })
  const [submittingReview, setSubmittingReview] = useState(false)

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
      } catch (err) {
        console.error('Error fetching kindergarten:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchData()
    }
  }, [id])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    
    try {
      await createReview({
        kinderGartenId: parseInt(id),
        authorName: reviewForm.authorName,
        commentText: reviewForm.commentText,
        score: reviewForm.score,
        authorId: crypto.randomUUID()
      })
      
      // Refresh reviews
      const newReviews = await getReviews(id)
      setReviews(Array.isArray(newReviews) ? newReviews : newReviews?.data || [])
      
      // Reset form
      setReviewForm({ authorName: '', commentText: '', score: 5 })
      setShowReviewForm(false)
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Sharh yuborishda xatolik yuz berdi')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleLikeReview = async (reviewId) => {
    try {
      await likeReview(reviewId, true)
      // Refresh reviews
      const newReviews = await getReviews(id)
      setReviews(Array.isArray(newReviews) ? newReviews : newReviews?.data || [])
    } catch (err) {
      console.error('Error liking review:', err)
    }
  }

  const renderStars = (rating, size = 'w-5 h-5') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const formatPrice = (price) => {
    if (!price) return "Narx ko'rsatilmagan"
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
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#d946ef] animate-spin" />
      </div>
    )
  }

  if (error || !kindergarten) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">Bog'cha topilmadi</p>
        <button 
          onClick={() => navigate('/search')}
          className="px-6 py-2 bg-[#d946ef] rounded-full hover:opacity-90"
        >
          Orqaga qaytish
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <Header className="relative" />

      {/* Back Navigation */}
      <div className="bg-[#1a1a3e] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Orqaga</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-8">
          <div className="relative h-72 bg-gradient-to-r from-[#1a1a4e] to-[#2a2a6e]">
            <img 
              src={kindergarten.profilePhoto || Logo} 
              alt={kindergarten.name}
              className={`w-full h-full ${kindergarten.profilePhoto ? 'object-cover' : 'object-contain p-12'}`}
              onError={(e) => {
                e.target.src = Logo
                e.target.className = "w-full h-full object-contain p-12"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white mb-2">{kindergarten.name}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{kindergarten.districtName || kindergarten.district?.districtName || kindergarten.location || 'Toshkent'}</span>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(kindergarten.score || 5, 'w-4 h-4')}
                  <span className="ml-1">({kindergarten.score || 5})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex gap-8 px-6">
              {[
                { id: 'info', label: "Ma'lumot" },
                { id: 'groups', label: `Guruhlar (${groups.length})` },
                { id: 'reviews', label: `Sharhlar (${reviews.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-[#d946ef] text-[#d946ef] font-medium' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  {kindergarten.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tavsif</h3>
                      <p className="text-gray-600 leading-relaxed">{kindergarten.description}</p>
                    </div>
                  )}

                  {/* Features */}
                  {kindergarten.features?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Qo'shimcha imkoniyatlar</h3>
                      <div className="flex flex-wrap gap-3">
                        {kindergarten.features.map(feature => (
                          <div 
                            key={feature}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full"
                          >
                            <span>{featureIcons[feature] || '✨'}</span>
                            <span className="text-purple-700 text-sm font-medium">
                              {featureLabels[feature] || `Feature ${feature}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {kindergarten.languageGroups?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ta'lim tillari</h3>
                      <div className="flex flex-wrap gap-2">
                        {kindergarten.languageGroups.map(lang => (
                          <span 
                            key={lang}
                            className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium"
                          >
                            {languageLabels[lang] || `Language ${lang}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Working Days */}
                  {kindergarten.workingDaysInWeek?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ish kunlari</h3>
                      <div className="flex gap-2">
                        {Object.entries(workingDaysLabels).map(([key, label]) => (
                          <div
                            key={key}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                              kindergarten.workingDaysInWeek.includes(parseInt(key))
                                ? 'bg-[#d946ef] text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                  {/* Price Card */}
                  <div className="bg-gradient-to-r from-[#d946ef] to-[#ec4899] rounded-2xl p-6 text-white">
                    <p className="text-white/80 text-sm mb-1">Oylik to'lov</p>
                    <p className="text-2xl font-bold">{formatPrice(kindergarten.price)}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900">Bog'lanish</h4>
                    
                    {kindergarten.phoneNumber && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={18} className="text-[#d946ef]" />
                        <a href={`tel:${kindergarten.phoneNumber}`} className="hover:text-[#d946ef]">
                          {kindergarten.phoneNumber}
                        </a>
                      </div>
                    )}
                    
                    {kindergarten.address && (
                      <div className="flex items-start gap-3 text-gray-600">
                        <MapPin size={18} className="text-[#d946ef] mt-0.5" />
                        <span>{kindergarten.address}</span>
                      </div>
                    )}
                    
                    {(kindergarten.workingStartHour || kindergarten.workingEndHour) && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock size={18} className="text-[#d946ef]" />
                        <span>
                          {formatTime(kindergarten.workingStartHour) || '08:00'} - {formatTime(kindergarten.workingEndHour) || '18:00'}
                        </span>
                      </div>
                    )}

                    {kindergarten.meals !== undefined && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Utensils size={18} className="text-[#d946ef]" />
                        <span>{mealsLabels[kindergarten.meals] || 'Ovqatlanish'}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button className="w-full py-4 bg-[#1a1a3e] text-white rounded-2xl font-medium hover:bg-[#2a2a4e] transition-colors">
                    Ariza qoldirish
                  </button>
                </div>
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div>
                {groups.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Guruhlar haqida ma'lumot mavjud emas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map(group => (
                      <div key={group.id} className="bg-gray-50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-[#d946ef]/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-[#d946ef]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{group.name || 'Guruh'}</h4>
                            <p className="text-sm text-gray-500">{group.ageRange || 'Yosh chegarasi'}</p>
                          </div>
                        </div>
                        {group.capacity && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Sig'imi:</span> {group.capacity} ta bola
                          </p>
                        )}
                        {group.currentCount !== undefined && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Hozirda:</span> {group.currentCount} ta bola
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {/* Add Review Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-6 py-3 bg-[#d946ef] text-white rounded-full font-medium hover:opacity-90 transition-all"
                  >
                    {showReviewForm ? 'Bekor qilish' : 'Sharh qoldirish'}
                  </button>
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Yangi sharh</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ismingiz</label>
                      <input
                        type="text"
                        value={reviewForm.authorName}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, authorName: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d946ef]"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Baho</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, score }))}
                            className="p-1"
                          >
                            <Star 
                              className={`w-8 h-8 ${score <= reviewForm.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sharh matni</label>
                      <textarea
                        value={reviewForm.commentText}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, commentText: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#d946ef] resize-none"
                        rows={4}
                        maxLength={100}
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">{reviewForm.commentText.length}/100</p>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex items-center gap-2 px-6 py-3 bg-[#d946ef] text-white rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      Yuborish
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Hali sharhlar yo'q</p>
                    <p className="text-sm mt-1">Birinchi bo'lib sharh qoldiring!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-gray-50 rounded-2xl p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#d946ef]/10 rounded-full flex items-center justify-center">
                              <span className="text-[#d946ef] font-semibold">
                                {review.authorName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{review.authorName || 'Foydalanuvchi'}</h5>
                              <div className="flex items-center gap-1">
                                {renderStars(review.score || 5, 'w-3 h-3')}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLikeReview(review.id)}
                            className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart size={18} />
                            <span className="text-sm">{review.likes || 0}</span>
                          </button>
                        </div>
                        <p className="text-gray-600">{review.commentText}</p>
                        {review.createdAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(review.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default KindergartenDetail
