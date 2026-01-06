// API Configuration
const API_BASE_URL = 'https://api.birbola.uz/api/v1'

// Enum mappings
export const Features = {
  POOL: 1,        // Basseyn
  MOSQUE: 2,      // Masjid
  LOGOPED: 3,     // Logoped
  MASSAGE: 4,     // Massaj
  PLAYGROUND: 5,  // O'yin maydoni
  MEDICAL: 6      // Tibbiy xizmat
}

export const LanguagesEnum = {
  UZBEK: 0,
  RUSSIAN: 1,
  ENGLISH: 2,
  ARABIC: 3,
  KOREAN: 4,
  CHINESE: 5,
  TURKISH: 6
}

export const WorkingDaysOfWeek = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6
}

export const Meals = {
  NONE: 0,
  BREAKFAST: 1,
  LUNCH: 2,
  DINNER: 3,
  FULL: 4
}

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  // Check if response has content
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

// ==================== Kindergarten API ====================

/**
 * Get all kindergartens with optional filters
 * @param {Object} params - Filter parameters
 * @param {string} params.search - Search query
 * @param {number[]} params.districtId - Array of district IDs
 * @param {number[]} params.features - Array of feature enums
 * @param {number[]} params.languageGroups - Array of language enums
 * @param {number[]} params.workingDaysInWeek - Array of working days
 * @param {number} params.priceRangeStart - Minimum price
 * @param {number} params.priceRangeEnd - Maximum price
 * @param {number} params.score - Minimum rating score
 * @param {number} params.pageNumber - Page number (1-indexed)
 * @param {number} params.pageSize - Items per page (5-100)
 */
export async function getKindergartens(params = {}) {
  const queryParams = new URLSearchParams()

  if (params.search) queryParams.append('Search', params.search)
  if (params.priceRangeStart) queryParams.append('PriceRangeStart', params.priceRangeStart)
  if (params.priceRangeEnd) queryParams.append('PriceRangeEnd', params.priceRangeEnd)
  if (params.score) queryParams.append('Score', params.score)
  if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber)
  if (params.pageSize) queryParams.append('PageSize', params.pageSize)

  // Handle array parameters
  if (params.districtId?.length) {
    params.districtId.forEach(id => queryParams.append('DistrictId', id))
  }
  if (params.features?.length) {
    params.features.forEach(f => queryParams.append('Features', f))
  }
  if (params.languageGroups?.length) {
    params.languageGroups.forEach(l => queryParams.append('LanguageGroups', l))
  }
  if (params.workingDaysInWeek?.length) {
    params.workingDaysInWeek.forEach(d => queryParams.append('WorkingDaysInWeek', d))
  }
  if (params.meals !== undefined) {
    queryParams.append('Meals', params.meals)
  }

  const queryString = queryParams.toString()
  const endpoint = `/Kindergarten/GetAll${queryString ? `?${queryString}` : ''}`
  
  return fetchAPI(endpoint)
}

/**
 * Get kindergarten by ID
 * @param {number} id - Kindergarten ID
 */
export async function getKindergartenById(id) {
  return fetchAPI(`/Kindergarten/GetById/${id}`)
}

// ==================== District API ====================

/**
 * Get all districts
 */
export async function getDistricts() {
  return fetchAPI('/District/GetAll')
}

/**
 * Get district by ID
 * @param {number} districtId - District ID
 */
export async function getDistrictById(districtId) {
  return fetchAPI(`/District/Get/${districtId}`)
}

// ==================== Reviews API ====================

/**
 * Get all reviews for a kindergarten
 * @param {number} gartenId - Kindergarten ID
 */
export async function getReviews(gartenId) {
  return fetchAPI(`/Reviews/GetAll${gartenId}`)
}

/**
 * Create a review
 * @param {Object} review - Review data
 * @param {number} review.kinderGartenId - Kindergarten ID
 * @param {string} review.commentText - Review text (max 100 chars)
 * @param {string} review.authorName - Author name
 * @param {string} review.authorId - Author UUID
 * @param {number} review.score - Rating 1-5
 */
export async function createReview(review) {
  return fetchAPI('/Reviews/CreateReview', {
    method: 'POST',
    body: JSON.stringify(review)
  })
}

/**
 * Like/unlike a review
 * @param {string} reviewId - Review UUID
 * @param {boolean} like - True to like, false to unlike
 */
export async function likeReview(reviewId, like) {
  return fetchAPI(`/Reviews/LikeReview${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify({ reviewId, like })
  })
}

// ==================== Subjects API ====================

/**
 * Get all subjects
 */
export async function getSubjects() {
  return fetchAPI('/Subjects/GetAll')
}

/**
 * Get all subject types
 */
export async function getSubjectTypes() {
  return fetchAPI('/Subjects/GetAllSubjectTypes')
}

/**
 * Get subjects by group ID
 * @param {string} groupId - Group UUID
 */
export async function getSubjectsByGroup(groupId) {
  return fetchAPI(`/Subjects/GetAll/${groupId}`)
}

// ==================== Groups API ====================

/**
 * Get group by ID
 * @param {string} groupId - Group UUID
 */
export async function getGroupById(groupId) {
  return fetchAPI(`/Group/GetById/${groupId}`)
}

/**
 * Get all groups for a kindergarten
 * @param {number} kgartenId - Kindergarten ID
 */
export async function getKindergartenGroups(kgartenId) {
  return fetchAPI(`/Group/GetKindergartenGroups/${kgartenId}`)
}

export default {
  // Kindergarten
  getKindergartens,
  getKindergartenById,
  // Districts
  getDistricts,
  getDistrictById,
  // Reviews
  getReviews,
  createReview,
  likeReview,
  // Subjects
  getSubjects,
  getSubjectTypes,
  getSubjectsByGroup,
  // Groups
  getGroupById,
  getKindergartenGroups,
  // Enums
  Features,
  LanguagesEnum,
  WorkingDaysOfWeek,
  Meals
}
