import { useState, useEffect, useCallback, useRef } from 'react'
import { getKindergartens, getDistricts, getKindergartenById, getReviews, getKindergartenGroups, getSubjects } from '../services/api'

/** Paged list body from Kindergarten/GetAll (camelCase or PascalCase). */
function extractPagedItems(response) {
  if (Array.isArray(response)) return response
  if (!response || typeof response !== 'object') return []
  const topItems = response.items ?? response.Items
  if (Array.isArray(topItems)) return topItems
  const data = response.data ?? response.Data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const nested = data.items ?? data.Items
    if (Array.isArray(nested)) return nested
  }
  return []
}

function readPagedMeta(response, filters, itemsLength) {
  const pageNumber = response.pageNumber ?? response.PageNumber ?? filters.pageNumber
  const pageSize = response.pageSize ?? response.PageSize ?? filters.pageSize
  const totalCount = response.totalCount ?? response.TotalCount ?? itemsLength
  const totalPages = response.totalPages ?? response.TotalPages
  return {
    pageNumber,
    pageSize,
    totalCount: typeof totalCount === 'number' ? totalCount : itemsLength,
    totalPages: typeof totalPages === 'number' ? totalPages : null,
  }
}

/**
 * Custom hook for fetching and managing kindergartens data
 */
export function useKindergartens(initialFilters = {}) {
  const [kindergartens, setKindergartens] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)
  const isFirstFetchRef = useRef(true)
  const [filters, setFilters] = useState({
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
    pageSize: 9,
    ...initialFilters
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  const fetchKindergartens = useCallback(async () => {
    if (isFirstFetchRef.current) {
      setLoading(true)
    }
    setIsFetching(true)
    setError(null)

    try {
      const response = await getKindergartens(filters)
      
      if (response) {
        if (Array.isArray(response)) {
          setKindergartens(response)
          setPagination({
            currentPage: filters.pageNumber,
            totalPages: Math.ceil(response.length / filters.pageSize) || 1,
            totalItems: response.length,
          })
        } else {
          const items = extractPagedItems(response)
          const meta = readPagedMeta(response, filters, items.length)
          const apiTotal = meta.totalCount
          const pageSize = filters.pageSize
          const pageNum = filters.pageNumber

          // API sometimes reports a huge totalCount but only returns rows for "page 1"
          // and empty lists for page 2+ — avoid false totals and useless pagination.
          const shouldSnapToFirstPage =
            items.length === 0 &&
            pageNum > 1 &&
            apiTotal > pageSize * (pageNum - 1)

          if (shouldSnapToFirstPage) {
            setFilters((prev) => ({ ...prev, pageNumber: 1 }))
            return
          }

          setKindergartens(items)

          let totalItems = apiTotal
          let totalPages =
            meta.totalPages != null && meta.totalPages > 0
              ? meta.totalPages
              : Math.ceil(apiTotal / pageSize) || 1

          const shortFirstPage =
            pageNum === 1 &&
            items.length > 0 &&
            items.length < pageSize &&
            apiTotal > items.length

          if (shortFirstPage) {
            totalItems = items.length
            totalPages = 1
          }

          setPagination({
            currentPage: meta.pageNumber || pageNum,
            totalPages,
            totalItems,
          })
        }
      } else {
        setKindergartens([])
      }
    } catch (err) {
      console.error('Error fetching kindergartens:', err)
      setError(err.message)
      setKindergartens([])
    } finally {
      setIsFetching(false)
      setLoading(false)
      isFirstFetchRef.current = false
    }
  }, [filters])

  useEffect(() => {
    fetchKindergartens()
  }, [fetchKindergartens])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      pageNumber: newFilters.pageNumber !== undefined ? newFilters.pageNumber : 1
    }))
  }, [])

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, pageNumber: page }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
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
      pageSize: 9
    })
  }, [])

  return {
    kindergartens,
    loading,
    isFetching,
    error,
    filters,
    pagination,
    updateFilters,
    setPage,
    resetFilters,
    refetch: fetchKindergartens
  }
}

/**
 * Custom hook for fetching districts
 */
export function useDistricts() {
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const response = await getDistricts()
        if (Array.isArray(response)) {
          setDistricts(response)
        } else if (response?.data) {
          setDistricts(response.data)
        } else {
          setDistricts([])
        }
      } catch (err) {
        console.error('Error fetching districts:', err)
        setError(err.message)
        setDistricts([])
      } finally {
        setLoading(false)
      }
    }

    fetchDistricts()
  }, [])

  return { districts, loading, error }
}

/**
 * Custom hook for fetching a single kindergarten with all related data
 */
export function useKindergartenDetail(id) {
  const [kindergarten, setKindergarten] = useState(null)
  const [reviews, setReviews] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    
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
      console.error('Error fetching kindergarten detail:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { 
    kindergarten, 
    reviews, 
    groups, 
    loading, 
    error, 
    refetch: fetchData 
  }
}

/**
 * Custom hook for fetching subjects
 */
export function useSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await getSubjects()
        if (Array.isArray(response)) {
          setSubjects(response)
        } else if (response?.data) {
          setSubjects(response.data)
        } else {
          setSubjects([])
        }
      } catch (err) {
        console.error('Error fetching subjects:', err)
        setError(err.message)
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  return { subjects, loading, error }
}

export default useKindergartens
