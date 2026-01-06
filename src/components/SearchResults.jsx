import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Star, MapPin, Search, SlidersHorizontal, Loader2, X, Filter } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import { useKindergartens, useDistricts } from '../hooks/useKindergartens'
import { Features, LanguagesEnum, WorkingDaysOfWeek, Meals } from '../services/api'

// Feature labels in Uzbek
const featureLabels = {
  [Features.POOL]: 'Basseyn',
  [Features.MOSQUE]: 'Masjid',
  [Features.LOGOPED]: 'Logoped',
  [Features.MASSAGE]: 'Massaj',
  [Features.PLAYGROUND]: "O'yin maydoni",
  [Features.MEDICAL]: 'Tibbiy xizmat'
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
  [WorkingDaysOfWeek.MONDAY]: 'Dushanba',
  [WorkingDaysOfWeek.TUESDAY]: 'Seshanba',
  [WorkingDaysOfWeek.WEDNESDAY]: 'Chorshanba',
  [WorkingDaysOfWeek.THURSDAY]: 'Payshanba',
  [WorkingDaysOfWeek.FRIDAY]: 'Juma',
  [WorkingDaysOfWeek.SATURDAY]: 'Shanba',
  [WorkingDaysOfWeek.SUNDAY]: 'Yakshanba'
}

// Meals labels
const mealsLabels = {
  [Meals.NONE]: 'Ovqatsiz',
  [Meals.BREAKFAST]: 'Nonushta',
  [Meals.LUNCH]: 'Tushlik',
  [Meals.DINNER]: 'Kechki ovqat',
  [Meals.FULL]: "To'liq ovqat"
}

// Working schedule options
const workingScheduleOptions = [
  { value: 5, label: '5 kunlik' },
  { value: 6, label: '6 kunlik' },
  { value: 7, label: '7 kunlik' }
]

// Rating options
const ratingOptions = [
  { value: 5, label: '5 yulduz' },
  { value: 4, label: '4+ yulduz' },
  { value: 3, label: '3+ yulduz' },
  { value: 2, label: '2+ yulduz' },
  { value: 1, label: '1+ yulduz' }
]

const SearchResults = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [selectedWorkingDays, setSelectedWorkingDays] = useState([])
  const [selectedMeals, setSelectedMeals] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [workingSchedule, setWorkingSchedule] = useState('')
  const [priceRange, setPriceRange] = useState([500000, 250000000])
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  
  const { 
    kindergartens, 
    loading, 
    error, 
    pagination, 
    updateFilters, 
    setPage 
  } = useKindergartens()
  
  const { districts } = useDistricts()

  // Apply filters
  const handleApplyFilters = () => {
    // Calculate working days based on schedule selection
    let workingDays = selectedWorkingDays
    if (workingSchedule === '5') {
      workingDays = [0, 1, 2, 3, 4] // Mon-Fri
    } else if (workingSchedule === '6') {
      workingDays = [0, 1, 2, 3, 4, 5] // Mon-Sat
    } else if (workingSchedule === '7') {
      workingDays = [0, 1, 2, 3, 4, 5, 6] // Mon-Sun
    }

    updateFilters({
      search: searchQuery,
      districtId: selectedDistrict ? [parseInt(selectedDistrict)] : [],
      features: selectedFeatures,
      languageGroups: selectedLanguages,
      workingDaysInWeek: workingDays,
      meals: selectedMeals ? parseInt(selectedMeals) : undefined,
      score: selectedRating ? parseFloat(selectedRating) : undefined,
      priceRangeStart: priceRange[0],
      priceRangeEnd: priceRange[1],
      pageNumber: 1
    })
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('')
    setSelectedFeatures([])
    setSelectedLanguages([])
    setSelectedWorkingDays([])
    setSelectedMeals('')
    setSelectedRating('')
    setWorkingSchedule('')
    setPriceRange([500000, 250000000])
    
    updateFilters({
      search: '',
      districtId: [],
      features: [],
      languageGroups: [],
      workingDaysInWeek: [],
      meals: undefined,
      score: undefined,
      priceRangeStart: null,
      priceRangeEnd: null,
      pageNumber: 1
    })
  }

  // Toggle feature selection
  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  // Toggle language selection
  const toggleLanguage = (language) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    )
  }

  // Toggle working day selection
  const toggleWorkingDay = (day) => {
    setSelectedWorkingDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
    setWorkingSchedule('') // Clear schedule when manually selecting days
  }

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters()
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  // Sodiq School Logo SVG Component
  const SodiqLogo = () => (
    <svg viewBox="0 0 200 240" className="w-28 h-36">
      {/* Top section with S */}
      <rect x="40" y="20" width="55" height="70" rx="4" fill="#f97316" />
      <text x="67" y="68" fill="white" fontSize="36" fontWeight="bold" textAnchor="middle">S</text>
      
      {/* Top right decorative pattern */}
      <g fill="#f97316">
        <path d="M105 20 L160 20 L160 35 L120 35 L105 20Z" />
        <path d="M105 90 L160 90 L160 75 L120 75 L105 90Z" />
        <path d="M120 35 L160 35 L160 75 L120 75 L120 35Z" />
        <polygon points="120,45 140,55 120,65" fill="#1a1a4e" />
        <polygon points="160,45 140,55 160,65" fill="#1a1a4e" />
      </g>
      
      {/* Middle connecting bar */}
      <rect x="40" y="95" width="120" height="20" fill="#f97316" />
      <g fill="#1a1a4e">
        <polygon points="55,100 70,107 55,114" />
        <polygon points="85,100 100,107 85,114" />
        <polygon points="115,100 130,107 115,114" />
        <polygon points="145,100 160,107 145,114" />
      </g>
      
      {/* Bottom shield with S */}
      <path d="M40 120 L160 120 L160 180 L100 220 L40 180 Z" fill="#f97316" />
      <path d="M55 135 L145 135 L145 175 L100 200 L55 175 Z" fill="#1a1a4e" />
      <text x="100" y="178" fill="white" fontSize="32" fontWeight="bold" textAnchor="middle">S</text>
      
      {/* Horizontal lines at bottom */}
      <line x1="60" y1="205" x2="140" y2="205" stroke="#f97316" strokeWidth="3" />
      <line x1="70" y1="212" x2="130" y2="212" stroke="#f97316" strokeWidth="3" />
      <line x1="80" y1="219" x2="120" y2="219" stroke="#f97316" strokeWidth="3" />
    </svg>
  )

  const renderCardImage = (type) => {
    switch (type) {
      case 'orange-logo':
        return (
          <div className="w-full h-full bg-[#1a1a4e] flex items-center justify-center rounded-2xl">
            <SodiqLogo />
          </div>
        )
      case 'green-logo':
        return (
          <div className="w-full h-full bg-[#22c55e] flex items-center justify-center rounded-2xl">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
              <path d="M30 80V30L70 20V70L30 80Z" fill="white" fillOpacity="0.9"/>
              <path d="M70 20L85 35V85L70 70V20Z" fill="white" fillOpacity="0.7"/>
              <path d="M55 15L70 20L55 25V15Z" fill="white" fillOpacity="0.8"/>
            </svg>
          </div>
        )
      case 'blue-logo':
        return (
          <div className="w-full h-full bg-[#22c55e] flex items-center justify-center rounded-2xl">
            <div className="bg-[#1a1a4e] w-20 h-20 rounded-lg flex items-center justify-center">
              <SodiqLogo />
            </div>
          </div>
        )
      case 'building':
        return (
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop" 
              alt="School building"
              className="w-full h-full object-cover"
            />
          </div>
        )
      case 'building-green':
        return (
          <div className="w-full h-full rounded-2xl overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop" 
              alt="School building"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-[#22c55e] text-white text-xs px-2 py-1 rounded font-bold">
              SOMO SCHOOL
            </div>
          </div>
        )
      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-2xl">
            <span className="text-gray-400">No image</span>
          </div>
        )
    }
  }

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination
    const pages = []
    
    if (totalPages <= 1) return null

    // Calculate visible page range
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className="w-8 h-8 rounded-lg text-sm font-medium transition-all bg-[#2a2a4a] text-white hover:bg-[#3a3a5a]"
        >
          1
        </button>
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="w-8 h-8 flex items-center justify-center text-white">
            ...
          </span>
        )
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            currentPage === i 
              ? 'bg-cyan-400 text-white' 
              : 'bg-[#2a2a4a] text-white hover:bg-[#3a3a5a]'
          }`}
        >
          {i}
        </button>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="w-8 h-8 flex items-center justify-center text-white">
            ...
          </span>
        )
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="w-8 h-8 rounded-lg text-sm font-medium transition-all bg-[#2a2a4a] text-white hover:bg-[#3a3a5a]"
        >
          {totalPages}
        </button>
      )
    }

    return pages
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]">
      {/* Header */}
      <Header className="relative" />

      {/* Search Bar Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1e1e3f] border border-[#3a3a6a] rounded-2xl px-4 py-3 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Back Button & Title */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-white font-medium text-lg">Bog'chalar</span>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Izlash"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-[#2a2a4a]/50 text-white placeholder-gray-500 pl-11 pr-4 py-2.5 rounded-full border border-transparent focus:outline-none focus:border-[#3a3a6a] text-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative ml-auto">
              <button className="flex items-center gap-3 bg-transparent text-gray-400 hover:text-white px-4 py-2 rounded-full transition-all">
                <span className="text-sm">Yangilari</span>
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#ebe5f5] rounded-3xl p-6">
            <div className="flex flex-col lg:flex-row gap-6 relative">
              {/* Filter Sidebar */}
              <div className="w-full lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-6 lg:h-fit z-30">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden w-full mb-4 bg-white text-gray-900 font-medium py-3 rounded-2xl shadow-sm flex items-center justify-center gap-2"
                >
                  <Filter size={20} />
                  Filtrlash
                </button>

                {/* Mobile Filter Overlay */}
                <div 
                  className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300 ${
                    isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                  onClick={() => setIsMobileFilterOpen(false)}
                />

                <div className={`
                  fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out p-6 overflow-y-auto custom-scrollbar
                  lg:transform-none lg:static lg:w-full lg:rounded-3xl lg:shadow-sm lg:block lg:max-h-[calc(100vh-48px)]
                  ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900">Filter</h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={handleResetFilters}
                        className="text-xs text-[#d946ef] hover:underline"
                      >
                        Tozalash
                      </button>
                      <button 
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-600"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Manzil - District */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Manzil</label>
                    <div className="relative">
                      <select 
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full appearance-none focus:outline-none focus:border-gray-300 text-sm"
                      >
                        <option value="">Barcha tumanlar</option>
                        {districts.map(district => (
                          <option key={district.id} value={district.id}>
                            {district.districtName || district.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>

                  {/* Ish vaqti - Working Schedule */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Ish vaqti</label>
                    <div className="relative">
                      <select 
                        value={workingSchedule}
                        onChange={(e) => setWorkingSchedule(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full appearance-none focus:outline-none focus:border-gray-300 text-sm"
                      >
                        <option value="">Tanlang</option>
                        {workingScheduleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>

                  {/* Ish kunlari - Working Days */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Ish kunlari</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(workingDaysLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleWorkingDay(parseInt(key))}
                          className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                            selectedWorkingDays.includes(parseInt(key))
                              ? 'bg-[#8b5cf6] text-white border border-[#8b5cf6]'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {label.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reyting - Rating */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Reyting</label>
                    <div className="relative">
                      <select 
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full appearance-none focus:outline-none focus:border-gray-300 text-sm"
                      >
                        <option value="">Barcha reytinglar</option>
                        {ratingOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>

                  {/* Ovqatlanish - Meals */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Ovqatlanish</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(mealsLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedMeals(selectedMeals === key ? '' : key)}
                          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                            selectedMeals === key
                              ? 'bg-[#f59e0b] text-white border border-[#f59e0b]'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Qo'shimcha imkoniyatlar - Features */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Qo'shimcha imkoniyatlar</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(featureLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleFeature(parseInt(key))}
                          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                            selectedFeatures.includes(parseInt(key))
                              ? 'bg-[#d946ef] text-white border border-[#d946ef]'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tillar - Languages */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Ta'lim tili</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(languageLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleLanguage(parseInt(key))}
                          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                            selectedLanguages.includes(parseInt(key))
                              ? 'bg-[#06b6d4] text-white border border-[#06b6d4]'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Narx - Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-800 mb-3">Narx</label>
                    <div className="relative pt-2 px-1 h-6">
                      {/* Range Inputs */}
                      <input
                        type="range"
                        min="500000"
                        max="250000000"
                        step="500000"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), priceRange[1] - 1000000);
                          setPriceRange([val, priceRange[1]]);
                        }}
                        className="range-slider-input top-2 left-0 z-20"
                      />
                      <input
                        type="range"
                        min="500000"
                        max="250000000"
                        step="500000"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), priceRange[0] + 1000000);
                          setPriceRange([priceRange[0], val]);
                        }}
                        className="range-slider-input top-2 left-0 z-20"
                      />

                      {/* Visual Track */}
                      <div className="absolute top-2 left-0 w-full h-1 bg-gray-200 rounded-full z-10 pointer-events-none">
                        <div 
                          className="absolute h-1 bg-[#d946ef] rounded-full"
                          style={{ 
                            left: `${((priceRange[0] - 500000) / (250000000 - 500000)) * 100}%`, 
                            right: `${100 - ((priceRange[1] - 500000) / (250000000 - 500000)) * 100}%` 
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-400 mt-6 pointer-events-none">
                        <span>{(priceRange[0] / 1000000).toFixed(1)}M</span>
                        <span>{(priceRange[1] / 1000000).toFixed(0)}M</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Filter Button */}
                  <button 
                    onClick={() => {
                      handleApplyFilters()
                      setIsMobileFilterOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white font-medium py-3 rounded-full hover:opacity-90 transition-all shadow-lg shadow-pink-200"
                  >
                    Filterni qo'llash
                  </button>
                </div>
              </div>

              {/* Results Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 text-[#d946ef] animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <p className="text-lg mb-2">Xatolik yuz berdi</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : kindergartens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <p className="text-lg">Hech narsa topilmadi</p>
                    <p className="text-sm mt-2">Boshqa filtrlarni sinab ko'ring</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {kindergartens.map((kg) => (
                      <div 
                        key={kg.id} 
                        onClick={() => navigate(`/kindergarten/${kg.id}`)}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 cursor-pointer hover:scale-[1.02]"
                      >
                        {/* Card Header */}
                        <div className="px-5 pt-5 pb-3">
                          <h3 className="text-base font-bold text-gray-900">{kg.name}</h3>
                        </div>

                        {/* Card Image */}
                        <div className="px-4">
                          <div className="h-44 relative rounded-2xl overflow-hidden">
                            {kg.profilePhoto ? (
                              <img 
                                src={kg.profilePhoto} 
                                alt={kg.name}
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-[#1a1a4e] flex items-center justify-center rounded-2xl ${kg.profilePhoto ? 'hidden' : ''}`}>
                              <SodiqLogo />
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-gray-900 font-semibold text-sm">{kg.location || 'Toshkent shaxri'}</p>
                              <p className="text-gray-400 text-sm mt-0.5">{kg.district?.districtName || kg.districtName || 'Tuman'}</p>
                              <div className="flex items-center gap-0.5 mt-2">
                                {renderStars(kg.score || kg.rating || 5)}
                              </div>
                            </div>
                            <button 
                              onClick={(e) => e.stopPropagation()}
                              className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <MapPin className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!loading && kindergartens.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-6 bg-[#1a1a3e] rounded-2xl px-4 py-3">
                    <p className="text-gray-400 text-sm text-center sm:text-left">
                      Показано: {((pagination.currentPage - 1) * 9) + 1} - {Math.min(pagination.currentPage * 9, pagination.totalItems)} / {pagination.totalItems}
                    </p>
                    <div className="flex items-center gap-1">
                      {renderPagination()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default SearchResults
