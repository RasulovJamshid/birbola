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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 40)
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else {
        setIsHeaderVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

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

  // Debounced auto-apply filters
  useEffect(() => {
    const timer = setTimeout(() => {
      let workingDays = selectedWorkingDays
      if (workingSchedule === '5') workingDays = [0, 1, 2, 3, 4]
      else if (workingSchedule === '6') workingDays = [0, 1, 2, 3, 4, 5]
      else if (workingSchedule === '7') workingDays = [0, 1, 2, 3, 4, 5, 6]

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
    }, 300)
    
    return () => clearTimeout(timer)
  }, [debouncedSearchQuery, selectedDistrict, selectedFeatures, selectedLanguages, selectedWorkingDays, selectedMeals, selectedRating, workingSchedule, priceRange])


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

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedDistrict) count++
    count += selectedFeatures.length
    count += selectedLanguages.length
    count += selectedWorkingDays.length
    if (selectedMeals) count++
    if (selectedRating) count++
    if (workingSchedule) count++
    if (priceRange[0] > 0 || priceRange[1] < 250000000) count++
    return count
  }

  const renderActiveChips = () => {
    const chips = []
    
    if (selectedDistrict) {
      const district = districts.find(d => d.id.toString() === selectedDistrict)
      if (district) chips.push({ label: district.districtName || district.name, type: 'district' })
    }
    
    selectedFeatures.forEach(f => chips.push({ label: featureLabels[f], type: 'feature', value: f }))
    selectedLanguages.forEach(l => chips.push({ label: languageLabels[l], type: 'language', value: l }))
    
    if (chips.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mb-6 animate-fadeIn">
        {chips.map((chip, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70 hover:border-[#d946ef]/40 transition-colors">
            {chip.label}
            <button 
              onClick={() => {
                if (chip.type === 'district') setSelectedDistrict('')
                if (chip.type === 'feature') toggleFeature(chip.value)
                if (chip.type === 'language') toggleLanguage(chip.value)
              }}
              className="hover:text-[#d946ef] transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button 
          onClick={handleResetFilters}
          className="text-xs font-bold text-[#d946ef] hover:text-[#c026d3] ml-2 transition-colors"
        >
          Tozalash
        </button>
      </div>
    )
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
    <div className="min-h-screen bg-[#090318] selection:bg-[#d946ef]/30 font-sans pt-[64px]">
      <Header className="fixed top-0 left-0 right-0 z-50" hideOnScroll={true} enableSticky={false} isTransparentInitially={false} />

      <div className={`sticky top-[60px] z-100 sticky-search-bar ${!isHeaderVisible ? 'at-top' : ''} ${isScrolled ? 'is-scrolled' : ''} border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className={`flex items-center gap-4 transition-all duration-500 ${!isHeaderVisible ? 'md:mr-4' : ''}`}>
            <button 
              onClick={() => router.push('/')}
              className="group w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#d946ef]/50 transition-all"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                Bog'chalar
              </h1>
              <span className={`text-[#d946ef] text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${!isHeaderVisible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {pagination.totalItems} ta natija
              </span>
            </div>
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
            <div className="flex bg-[#1a152e] p-1 rounded-2xl border border-white/10 mr-2">
              <button className="p-2 rounded-xl bg-[#d946ef] text-white shadow-lg"><SlidersHorizontal size={18} /></button>
              <button className="p-2 rounded-xl text-gray-500 hover:text-white transition-colors" onClick={() => {/* Toggle Map logic would go here if implemented */}}><MapPin size={18} /></button>
            </div>
            
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden btn-primary h-full px-5 relative"
            >
              <Filter size={18} />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#d946ef] rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border border-[#d946ef]/20">
                  {getActiveFiltersCount()}
                </span>
              )}
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
            lg:static lg:block lg:w-72 lg:flex-shrink-0 lg:sticky sticky-sidebar lg:bg-white/5 lg:border lg:border-white/10 lg:p-8 lg:z-30 lg:rounded-[2.5rem]
            ${!isHeaderVisible ? 'at-top' : 'lg:top-[140px]'}
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

            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {renderActiveChips()}
            
            {loading ? (
              <SearchSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                <X className="text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">Xatolik yuz berdi</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-secondary">Qayta urinish</button>
              </div>
            ) : kindergartens.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-white/[0.02] rounded-[3rem] border border-white/5 p-12 backdrop-blur-md">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                  <Search className="text-amber-500" size={40} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Hech narsa topilmadi</h3>
                <p className="text-white/40 mb-8 max-w-xs mx-auto leading-relaxed">
                  Qidiruvingizga mos bog'chalar mavjud emas. Filtrlarni o'zgartirib ko'ring.
                </p>
                <button onClick={handleResetFilters} className="btn-primary">
                  Filtrlarni tozalash
                </button>
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