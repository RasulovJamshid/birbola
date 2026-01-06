import { useState, useEffect, useCallback } from 'react'
import { getKindergartens, getDistricts, getKindergartenById, getReviews, getKindergartenGroups, getSubjects } from '../services/api'

/**
 * Custom hook for fetching and managing kindergartens data
 */
export function useKindergartens(initialFilters = {}) {
  const [kindergartens, setKindergartens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
    setLoading(true)
    setError(null)
    
    try {
      const response = await getKindergartens(filters)
      
      if (response) {
        // Handle different response formats
        if (Array.isArray(response)) {
          setKindergartens(response)
          setPagination({
            currentPage: filters.pageNumber,
            totalPages: Math.ceil(response.length / filters.pageSize) || 1,
            totalItems: response.length
          })
        } else if (response.data || response.items) {
          const items = response.data || response.items || []
          setKindergartens(items)
          setPagination({
            currentPage: response.pageNumber || filters.pageNumber,
            totalPages: response.totalPages || Math.ceil((response.totalCount || items.length) / filters.pageSize),
            totalItems: response.totalCount || items.length
          })
        } else {
          setKindergartens([])
        }
      } else {
        setKindergartens([])
      }
    } catch (err) {
      console.error('Error fetching kindergartens:', err)
      setError(err.message)
      setKindergartens([])
    } finally {
      setLoading(false)
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
