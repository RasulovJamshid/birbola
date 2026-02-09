'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown, Star, MapPin, Search, SlidersHorizontal, X, Filter, RotateCcw, Utensils, Languages, CalendarDays } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import KindergartenCard from './KindergartenCard'
import SearchSkeleton from './SearchSkeleton'
import { useKindergartens, useDistricts } from '../hooks/useKindergartens'
import { Features, LanguagesEnum, WorkingDaysOfWeek, Meals } from '../services/api'

// Labels mapping
const featureLabels = {
  [Features.POOL]: 'Basseyn',
  [Features.MOSQUE]: 'Masjid',
  [Features.LOGOPED]: 'Logoped',
  [Features.MASSAGE]: 'Massaj',
  [Features.PLAYGROUND]: "O'yin maydoni",
  [Features.MEDICAL]: 'Tibbiy xizmat'
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
  [Meals.NONE]: 'Yo\'q',
  [Meals.BREAKFAST]: 'Nonushta',
  [Meals.LUNCH]: 'Tushlik',
  [Meals.DINNER]: 'Kechki',
  [Meals.FULL]: "To'liq"
}

const workingScheduleOptions = [
  { value: 5, label: '5 kunlik' },
  { value: 6, label: '6 kunlik' },
  { value: 7, label: '7 kunlik' }
]

const ratingOptions = [
  { value: 5, label: '5 yulduz' },
  { value: 4, label: '4+ yulduz' },
  { value: 3, label: '3+ yulduz' },
  { value: 2, label: '2+ yulduz' },
  { value: 1, label: '1+ yulduz' }
]

const SearchResults = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [selectedWorkingDays, setSelectedWorkingDays] = useState([])
  const [selectedMeals, setSelectedMeals] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [workingSchedule, setWorkingSchedule] = useState('')
  const [priceRange, setPriceRange] = useState([0, 250000000])
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 250000000])
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    updateFilters({
      search: debouncedSearchQuery,
      districtId: selectedDistrict ? [parseInt(selectedDistrict)] : [],
      features: selectedFeatures,
      languageGroups: selectedLanguages,
      workingDaysInWeek: selectedWorkingDays,
      meals: selectedMeals ? parseInt(selectedMeals) : undefined,
      score: selectedRating ? parseFloat(selectedRating) : undefined,
      priceRangeStart: appliedPriceRange[0] > 0 ? appliedPriceRange[0] : null,
      priceRangeEnd: appliedPriceRange[1] < 250000000 ? appliedPriceRange[1] : null,
      pageNumber: 1
    })
  }, [debouncedSearchQuery])

  const handleApplyFilters = () => {
    let workingDays = selectedWorkingDays
    if (workingSchedule === '5') workingDays = [0, 1, 2, 3, 4]
    else if (workingSchedule === '6') workingDays = [0, 1, 2, 3, 4, 5]
    else if (workingSchedule === '7') workingDays = [0, 1, 2, 3, 4, 5, 6]

    setAppliedPriceRange(priceRange)
    updateFilters({
      search: debouncedSearchQuery,
      districtId: selectedDistrict ? [parseInt(selectedDistrict)] : [],
      features: selectedFeatures,
      languageGroups: selectedLanguages,
      workingDaysInWeek: workingDays,
      meals: selectedMeals ? parseInt(selectedMeals) : undefined,
      score: selectedRating ? parseFloat(selectedRating) : undefined,
      priceRangeStart: priceRange[0] > 0 ? priceRange[0] : null,
      priceRangeEnd: priceRange[1] < 250000000 ? priceRange[1] : null,
      pageNumber: 1
    })
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('')
    setSelectedFeatures([])
    setSelectedLanguages([])
    setSelectedWorkingDays([])
    setSelectedMeals('')
    setSelectedRating('')
    setWorkingSchedule('')
    setPriceRange([0, 250000000])
    setAppliedPriceRange([0, 250000000])
    
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

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature])
  }

  const toggleLanguage = (language) => {
    setSelectedLanguages(prev => prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language])
  }

  const toggleWorkingDay = (day) => {
    setSelectedWorkingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
    setWorkingSchedule('')
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') setDebouncedSearchQuery(searchQuery)
  }

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination
    if (totalPages <= 1) return null
    
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setPage(1)} className="w-10 h-10 rounded-xl text-sm font-bold transition-all bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">1</button>
      )
      if (startPage > 2) pages.push(<span key="dots-1" className="text-gray-600 px-1">...</span>)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
            currentPage === i ? 'bg-[#d946ef] text-white shadow-lg shadow-[#d946ef]/20' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {i}
        </button>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots-2" className="text-gray-600 px-1">...</span>)
      pages.push(
        <button key={totalPages} onClick={() => setPage(totalPages)} className="w-10 h-10 rounded-xl text-sm font-bold transition-all bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">{totalPages}</button>
      )
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#0f0a1f] selection:bg-[#d946ef]/30 font-sans">
      <Header className="relative" />

      <div className="sticky top-0 z-40 bg-[#0f0a1f]/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="group w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#d946ef]/50 transition-all"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Bog'chalar <span className="hidden sm:inline text-[#d946ef] text-sm font-normal ml-2 opacity-80">{pagination.totalItems} ta topildi</span>
            </h1>
          </div>

          <div className="flex-1 relative group h-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d946ef] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Nomi bo'yicha izlash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full h-full bg-[#1a152e] text-white placeholder-gray-400 pl-12 pr-12 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#d946ef]/20 focus:border-[#d946ef]/50 transition-all text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 h-12">
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 h-full px-5 bg-[#d946ef] text-white rounded-2xl font-bold shadow-lg shadow-[#d946ef]/20 transition-all active:scale-95"
            >
              <Filter size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2 h-full px-4 bg-[#1a152e] rounded-2xl border border-white/10 transition-colors hover:bg-white/10 group relative">
              <SlidersHorizontal size={16} className="text-gray-400 group-hover:text-[#d946ef] transition-colors" />
              <select className="bg-transparent text-white text-sm outline-none cursor-pointer h-full border-none appearance-none pr-6">
                <option value="new" className="bg-[#1a152e] text-white">Eng yangilari</option>
                <option value="rating" className="bg-[#1a152e] text-white">Reyting baland</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start relative">
          
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[60] bg-[#0f0a1f]/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileFilterOpen(false)} />
          )}

          <aside className={`
            fixed inset-y-4 left-4 right-4 z-[70] bg-[#1a152e] rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar transition-all duration-500
            lg:static lg:block lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-32 lg:bg-white/5 lg:border lg:border-white/10 lg:p-8 lg:z-30 lg:rounded-[2.5rem]
            ${isMobileFilterOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95 lg:translate-y-0 lg:opacity-100 lg:scale-100 hidden'}
          `}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Filter size={18} className="text-[#d946ef]" /> Filterlar
              </h2>
              <button onClick={handleResetFilters} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-[#d946ef] transition-all">
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tuman</label>
                <div className="relative">
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-[#1a152e] border border-white/10 text-white pl-4 pr-10 py-3 rounded-xl appearance-none focus:outline-none focus:border-[#d946ef]/50 text-sm"
                  >
                    <option value="" className="bg-[#1a152e] text-white">Barcha tumanlar</option>
                    {districts.map(d => <option key={d.id} value={d.id} className="bg-[#1a152e] text-white">{d.districtName || d.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#d946ef]" /> Ish grafigi
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {workingScheduleOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setWorkingSchedule(opt.value.toString())}
                      className={`px-4 py-2 text-sm rounded-xl border transition-all ${
                        workingSchedule === opt.value.toString() ? 'bg-[#d946ef] border-[#d946ef] text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.entries(workingDaysLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleWorkingDay(parseInt(key))}
                      className={`w-9 h-9 flex items-center justify-center text-[10px] font-bold rounded-lg border transition-all ${
                        selectedWorkingDays.includes(parseInt(key)) ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Utensils size={14} className="text-[#d946ef]" /> Ovqatlanish
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(mealsLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMeals(selectedMeals === key ? '' : key)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedMeals === key ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Languages size={14} className="text-[#d946ef]" /> Ta'lim tili
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(languageLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleLanguage(parseInt(key))}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedLanguages.includes(parseInt(key)) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Narx (oylik)</label>
                <div className="space-y-4 px-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>{(priceRange[0] / 1000000).toFixed(1)}M</span>
                    <span>{(priceRange[1] / 1000000).toFixed(0)}M</span>
                  </div>
                  <div className="relative h-2">
                    <input
                      type="range" min="0" max="250000000" step="1000000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1000000), priceRange[1]])}
                      className="range-slider-input"
                    />
                    <input
                      type="range" min="0" max="250000000" step="1000000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1000000)])}
                      className="range-slider-input"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Imkoniyatlar</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(featureLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleFeature(parseInt(key))}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all uppercase tracking-tight ${
                        selectedFeatures.includes(parseInt(key)) ? 'bg-[#d946ef] border-[#d946ef] text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { handleApplyFilters(); setIsMobileFilterOpen(false); }}
                className="w-full bg-gradient-to-r from-[#d946ef] to-[#ec4899] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#d946ef]/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Natijalarni ko'rish
              </button>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <SearchSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                <X className="text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Xatolik yuz berdi</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/10 text-white rounded-2xl font-bold border border-white/10">Qayta urinish</button>
              </div>
            ) : kindergartens.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                <Search className="text-amber-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Hech narsa topilmadi</h3>
                <p className="text-gray-400 mb-6">Mezonlarga mos bog'chalar mavjud emas.</p>
                <button onClick={handleResetFilters} className="px-8 py-3 bg-[#d946ef] text-white rounded-2xl font-bold">Filtrlarni tozalash</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {kindergartens.map((kg) => (
                  <KindergartenCard key={kg.id} kg={kg} onClick={() => router.push(`/kindergarten/${kg.id}`)} />
                ))}
              </div>
            )}

            {!loading && kindergartens.length > 0 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5 rounded-[2rem] p-6 border border-white/10">
                <p className="text-gray-400 text-sm font-medium">
                  Jami <span className="text-white">{pagination.totalItems}</span> ta natijadan <span className="text-white">{kindergartens.length}</span> tasi ko'rsatildi
                </p>
                <div className="flex items-center gap-2">
                  {renderPagination()}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SearchResults