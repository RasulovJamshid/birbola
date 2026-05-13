'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronDown, Star, Search, X, Filter, RotateCcw, Utensils, Languages, CalendarDays, LayoutGrid } from 'lucide-react'
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
  const searchParams = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const [searchQuery, setSearchQuery] = useState(qFromUrl)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(qFromUrl)
  const [sortBy, setSortBy] = useState(0)
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
  const [isScrolled, setIsScrolled] = useState(false)
  const searchScrollYRef = useRef(0)

  useEffect(() => {
    searchScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0

    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > 40)

      const prev = searchScrollYRef.current
      const delta = y - prev
      if (y < 20) {
        setIsHeaderVisible(true)
      } else if (delta > 2 && y > 40) {
        setIsHeaderVisible(false)
      } else if (delta < -2) {
        setIsHeaderVisible(true)
      }
      searchScrollYRef.current = y
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobileFilterOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobileFilterOpen])

  useEffect(() => {
    if (!isMobileFilterOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMobileFilterOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobileFilterOpen])

  const { 
    kindergartens, 
    loading, 
    isFetching,
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
    setSearchQuery((prev) => (qFromUrl !== prev ? qFromUrl : prev))
    setDebouncedSearchQuery((prev) => (qFromUrl !== prev ? qFromUrl : prev))
  }, [qFromUrl])

  useEffect(() => {
    const qs = debouncedSearchQuery.trim()
      ? `?q=${encodeURIComponent(debouncedSearchQuery.trim())}`
      : ''
    router.replace(`/search${qs}`, { scroll: false })
  }, [debouncedSearchQuery, router])

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
        pageNumber: 1,
        sort: sortBy === 1 ? 1 : undefined
      })
    }, 300)
    
    return () => clearTimeout(timer)
  }, [debouncedSearchQuery, selectedDistrict, selectedFeatures, selectedLanguages, selectedWorkingDays, selectedMeals, selectedRating, workingSchedule, priceRange, sortBy, updateFilters])


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
    
    setSortBy(0)
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
      pageNumber: 1,
      sort: undefined
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

  const getActiveFiltersCount = useMemo(() => {
    let count = 0
    if (selectedDistrict) count++
    count += selectedFeatures.length
    count += selectedLanguages.length
    if (workingSchedule) count++
    else count += selectedWorkingDays.length
    if (selectedMeals) count++
    if (selectedRating) count++
    if (priceRange[0] > 0 || priceRange[1] < 250000000) count++
    if (sortBy !== 0) count++
    return count
  }, [selectedDistrict, selectedFeatures, selectedLanguages, selectedWorkingDays, selectedMeals, selectedRating, workingSchedule, priceRange, sortBy])

  const renderActiveChips = () => {
    const chips = []

    if (selectedDistrict) {
      const district = districts.find((d) => d.id.toString() === selectedDistrict)
      if (district) {
        chips.push({
          key: 'district',
          label: district.districtName || district.name,
          onRemove: () => setSelectedDistrict(''),
        })
      }
    }

    selectedFeatures.forEach((f) =>
      chips.push({
        key: `f-${f}`,
        label: featureLabels[f],
        onRemove: () => toggleFeature(f),
      })
    )
    selectedLanguages.forEach((l) =>
      chips.push({
        key: `l-${l}`,
        label: languageLabels[l],
        onRemove: () => toggleLanguage(l),
      })
    )

    if (workingSchedule) {
      const wo = workingScheduleOptions.find((o) => o.value.toString() === workingSchedule)
      chips.push({
        key: 'schedule',
        label: wo?.label || workingSchedule,
        onRemove: () => setWorkingSchedule(''),
      })
    } else {
      selectedWorkingDays.forEach((d) =>
        chips.push({
          key: `wd-${d}`,
          label: workingDaysLabels[d],
          onRemove: () => toggleWorkingDay(d),
        })
      )
    }

    if (selectedMeals) {
      chips.push({
        key: 'meals',
        label: mealsLabels[selectedMeals],
        onRemove: () => setSelectedMeals(''),
      })
    }

    if (selectedRating) {
      const ro = ratingOptions.find((o) => String(o.value) === String(selectedRating))
      chips.push({
        key: 'rating',
        label: ro?.label || `Reyting ${selectedRating}+`,
        onRemove: () => setSelectedRating(''),
      })
    }

    if (priceRange[0] > 0 || priceRange[1] < 250000000) {
      chips.push({
        key: 'price',
        label: `Narx: ${(priceRange[0] / 1e6).toFixed(0)}–${(priceRange[1] / 1e6).toFixed(0)} mln`,
        onRemove: () => setPriceRange([0, 250000000]),
      })
    }

    if (sortBy !== 0) {
      chips.push({
        key: 'sort',
        label: sortBy === 1 ? 'Reyting bo‘yicha' : 'Saralash',
        onRemove: () => setSortBy(0),
      })
    }

    if (chips.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2 mb-4 animate-fadeIn" aria-label="Faol filtrlar">
        {chips.map((chip) => (
          <div
            key={chip.key}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/80 hover:border-[#d946ef]/40 transition-colors"
          >
            <span className="max-w-[200px] sm:max-w-[280px] truncate">{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="shrink-0 rounded-full p-0.5 text-white/50 hover:text-[#d946ef] transition-colors"
              aria-label={`${chip.label} filtrini olib tashlash`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button type="button" onClick={handleResetFilters} className="text-xs font-bold text-[#d946ef] hover:text-[#c026d3] ml-1 transition-colors self-center">
          Hammasini tozalash
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
    <div className="search-shell min-h-screen bg-[#090318] selection:bg-[#d946ef]/30 font-sans">
      <Header
        className="fixed top-0 left-0 right-0 z-50"
        compact
        hideOnScroll={true}
        enableSticky={false}
        isTransparentInitially={false}
      />

      <div
        className={`sticky z-[100] sticky-search-bar ${!isHeaderVisible ? 'at-top' : ''} ${isScrolled ? 'is-scrolled' : ''} border-b border-white/5 py-2 px-3 sm:px-5 lg:px-6`}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2 lg:flex-nowrap">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all hover:border-[#d946ef]/50 hover:text-white"
                aria-label="Bosh sahifaga qaytish"
              >
                <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="min-w-0 flex-1" aria-live="polite">
                <h1 className="truncate text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
                  Bog&apos;chalarni qidirish
                  {!loading && (
                    <span className="font-normal text-white/40">
                      {' '}
                      · <span className="text-white/70">{pagination.totalItems}</span> ta
                      {pagination.totalPages > 1 && (
                        <span className="text-white/35">
                          {' '}
                          ({pagination.currentPage}/{pagination.totalPages})
                        </span>
                      )}
                    </span>
                  )}
                  {isFetching && <span className="font-normal text-white/35"> — qidirilmoqda…</span>}
                </h1>
              </div>
            </div>

            <div className="flex w-full shrink-0 items-center gap-2 sm:ml-auto sm:w-auto lg:ml-0">
              <label className="sr-only" htmlFor="search-sort">
                Saralash
              </label>
              <div className="relative flex min-w-0 flex-1 sm:min-w-[180px] sm:flex-none">
                <LayoutGrid size={14} className="pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-gray-500" aria-hidden />
                <select
                  id="search-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(Number(e.target.value))}
                  className="h-9 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#1a152e] py-1.5 pl-9 pr-8 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-[#d946ef]/50 focus:ring-2 focus:ring-[#d946ef]/20"
                >
                  <option value={0} className="bg-[#1a152e] text-white">
                    Eng yangilari
                  </option>
                  <option value={1} className="bg-[#1a152e] text-white">
                    Reyting bo&apos;yicha
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-hidden
                />
              </div>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="btn-primary relative h-9 shrink-0 px-3 lg:hidden"
                aria-expanded={isMobileFilterOpen}
                aria-controls="search-filters-panel"
              >
                <span className="flex items-center gap-1.5">
                  <Filter size={16} aria-hidden />
                  <span className="text-xs font-bold sm:text-sm">Filtr</span>
                </span>
                {getActiveFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#d946ef]/30 bg-white px-0.5 text-[9px] font-black text-[#d946ef] shadow-lg">
                    {getActiveFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-[#d946ef]"
              size={18}
              aria-hidden
            />
            <input
              id="search-page-query"
              type="search"
              autoComplete="off"
              placeholder="Bog'cha nomi yoki manzil…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="h-10 w-full rounded-xl border border-white/10 bg-[#1a152e] py-2 pl-10 pr-10 text-sm text-white shadow-inner placeholder:text-gray-500 transition-all focus:border-[#d946ef]/50 focus:outline-none focus:ring-2 focus:ring-[#d946ef]/20"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Qidiruvni tozalash"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <main className="px-3 py-5 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 lg:gap-6 items-start relative">
          
          {isMobileFilterOpen && (
            <button
              type="button"
              className="fixed inset-0 z-[60] cursor-default border-0 bg-[#0f0a1f]/80 p-0 backdrop-blur-sm lg:hidden"
              aria-label="Filtrlarni yopish"
              onClick={() => setIsMobileFilterOpen(false)}
            />
          )}

          <aside
            id="search-filters-panel"
            className={`
            fixed inset-x-3 bottom-3 z-[70] flex max-h-[calc(100dvh-3.25rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a152e] p-4 shadow-2xl transition-all duration-300 sm:inset-x-5 sm:p-5
            ${isHeaderVisible ? 'max-lg:top-[44px]' : 'max-lg:top-[108px]'}
            lg:sticky lg:max-h-none lg:w-72 lg:flex-shrink-0 lg:self-start lg:rounded-2xl lg:border lg:bg-white/5 lg:p-6 lg:shadow-none sticky-sidebar
            ${!isHeaderVisible ? 'at-top' : ''}
            ${isMobileFilterOpen ? 'flex translate-y-0 opacity-100' : 'pointer-events-none hidden translate-y-[110%] opacity-0 lg:pointer-events-auto lg:flex lg:flex-col lg:translate-y-0 lg:opacity-100'}
          `}
          >
            <div className="mb-4 flex shrink-0 items-start justify-between gap-2 sm:mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-white">
                  <Filter size={16} className="text-[#d946ef]" aria-hidden />
                  Filtrlar
                </h2>
                <p className="mt-0.5 text-[10px] leading-snug text-white/40 lg:text-[11px]">
                  Tanlang — ro&apos;yxat avtomatik yangilanadi.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-[#d946ef]"
                  title="Filtrlarni tiklash"
                  aria-label="Filtrlarni tiklash"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
                  aria-label="Filtrlarni yopish"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1 custom-scrollbar lg:overflow-visible lg:pr-0">
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
                      type="button"
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
                      type="button"
                      onClick={() => toggleWorkingDay(parseInt(key))}
                      className={`w-9 h-9 flex items-center justify-center text-[10px] font-bold rounded-lg border transition-all ${
                        selectedWorkingDays.includes(parseInt(key)) ? 'bg-cyan-500 border-cyan-500 text-white' : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-white/35">
                  Haftalik shablon yoki alohida kunlarni tanlang (masalan, faqat dush–juma).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Utensils size={14} className="text-[#d946ef]" /> Ovqatlanish
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(mealsLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
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
                  <Star size={14} className="text-[#d946ef]" /> Minimal reyting
                </label>
                <p className="mb-2 text-[11px] text-white/35">Kamida shuncha yulduz va undan yuqori bog&apos;chalar.</p>
                <div className="flex flex-wrap gap-2">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setSelectedRating(selectedRating === String(opt.value) ? '' : String(opt.value))
                      }
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                        selectedRating === String(opt.value)
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Languages size={14} className="text-[#d946ef]" /> Ta'lim tili
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(languageLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
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
                <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-500">Narx (oylik, mln so&apos;m)</label>
                <div className="space-y-4 px-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400">
                    <span>{(priceRange[0] / 1000000).toFixed(1)} mln</span>
                    <span>{(priceRange[1] / 1000000).toFixed(0)} mln</span>
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
                      type="button"
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

            <div className="mt-3 flex shrink-0 gap-2 border-t border-white/10 pt-3 lg:hidden">
              <button type="button" onClick={handleResetFilters} className="btn-secondary flex-1 py-2.5 text-sm font-bold">
                Tiklash
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-primary flex-1 py-2.5 text-sm font-bold"
              >
                Natijalarni ko&apos;rish
              </button>
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
                <p className="mb-8 max-w-xs mx-auto leading-relaxed text-white/40">
                  Qidiruvingizga mos bog&apos;chalar mavjud emas. Filtrlarni o&apos;zgartirib ko&apos;ring.
                </p>
                <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                  <button type="button" onClick={handleResetFilters} className="btn-primary sm:min-w-[200px]">
                    Filtrlarni tozalash
                  </button>
                  <button
                    type="button"
                    className="btn-secondary sm:min-w-[200px] lg:hidden"
                    onClick={() => setIsMobileFilterOpen(true)}
                  >
                    Filtrlarni ochish
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {kindergartens.map((kg) => (
                  <KindergartenCard key={kg.id} kg={kg} onClick={() => router.push(`/kindergarten/${kg.id}`)} />
                ))}
              </div>
            )}

            {!loading && kindergartens.length > 0 && (
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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