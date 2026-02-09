// API Configuration
const API_BASE_URL = 'https://api.birbola.uz/api/v1'
const AUTH_BASE_URL = 'https://auth.birbola.uz/api'

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

// Helper function for Auth API calls
async function fetchAuthAPI(endpoint, options = {}) {
  const url = `${AUTH_BASE_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Auth API Error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  // Check if response has content
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

// ==================== Authentication API ====================

/**
 * Authenticate with Google
 * @param {Object} data - Google auth data
 * @param {string} data.idToken - Google ID token
 */
export async function authWithGoogle(data) {
  // Logic from the working example
  const params = new URLSearchParams()
  params.append('grant_type', 'urn:ietf:params:oauth:grant-type:google_identity_token')
  params.append('assertion', data.idToken)
  params.append('scope', 'openid profile email api offline_access')

  // Using fetch to match the project style, but with the working logic
  const response = await fetch('https://auth.birbola.uz/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Auth Error: ${response.status} - ${errorText}`)
  }

  // The working example expects { access_token, refresh_token }
  return response.json()
}

/**
 * Authenticate with email and password
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 * @param {number} [data.tenantId]
 */
export async function loginWithPassword(data) {
  const params = new URLSearchParams()
  params.append('grant_type', 'password')
  params.append('username', data.email)
  params.append('password', data.password)
  params.append('scope', 'openid profile email api offline_access')
  if (data.tenantId !== undefined) {
    params.append('tenant_id', data.tenantId)
  }

  const response = await fetch('https://auth.birbola.uz/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Auth Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * Authenticate with Instagram
 * @param {Object} data - Instagram auth data
 * @param {string} data.code - Instagram authorization code
 * @param {number} data.tenantId - Tenant ID (default: 0)
 */
export async function authWithInstagram(data) {
  return fetchAuthAPI('/external/instagram', {
    method: 'POST',
    body: JSON.stringify({
      code: data.code,
      tenantId: data.tenantId || 0
    })
  })
}

/**
 * Authenticate with Telegram
 * @param {Object} data - Telegram auth data
 * @param {number} data.tenantId - Tenant ID (default: 0)
 */
export async function authWithTelegram(data) {
  return fetchAuthAPI('/external/telegram', {
    method: 'POST',
    body: JSON.stringify({
      tenantId: data.tenantId || 0,
      ...data
    })
  })
}

/**
 * Register a new parent user
 * @param {Object} data
 * @param {string} data.name - Full name
 * @param {string} data.email
 * @param {string} data.password
 */
export async function registerParent(data) {
  const trimmedName = data.name ? data.name.trim() : ''
  const parts = trimmedName.split(' ').filter(Boolean)
  let firstName = trimmedName
  let lastName = trimmedName

  if (parts.length > 1) {
    firstName = parts[0]
    lastName = parts.slice(1).join(' ')
  }

  const body = {
    userName: data.email,
    email: data.email,
    password: data.password,
    firstName,
    lastName,
    phoneCountry: data.phoneCountry || null,
    phoneNational: data.phoneNational || null,
    tenantId: data.tenantId ?? null
  }

  return fetchAuthAPI('/Auth/register', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

/**
 * Get current authenticated user
 * @param {string} accessToken
 */
export async function getCurrentUser(accessToken) {
  return fetchAuthAPI('/Users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
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
export async function getKindergartens(params = {}, options = {}) {
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

  return fetchAPI(endpoint, options)
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

// ==================== Community API (7 mahalla) ====================

/**
 * Get community feed with posts
 * @param {Object} params - Filter parameters
 * @param {number} params.pageNumber - Page number
 * @param {number} params.pageSize - Items per page (5-100)
 * @param {number} params.kindergartenId - Filter by kindergarten ID
 * @param {number} params.sort - Sort order (0: Recent, 1: Popular)
 * @param {string} accessToken - User access token
 */
export async function getCommunityFeed(params = {}, accessToken) {
  const queryParams = new URLSearchParams()
  
  if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber)
  if (params.pageSize) queryParams.append('PageSize', params.pageSize)
  if (params.kindergartenId) queryParams.append('kindergartenId', params.kindergartenId)
  if (params.sort !== undefined) queryParams.append('sort', params.sort)
  
  const queryString = queryParams.toString()
  const endpoint = `/Community/feed${queryString ? `?${queryString}` : ''}`
  
  return fetchAPI(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

/**
 * Get comments for a post
 * @param {string} postId - Post UUID
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 20)
 * @param {string} accessToken - User access token
 */
export async function getPostComments(postId, page = 1, size = 20, accessToken) {
  return fetchAPI(`/Community/posts/${postId}/comments?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

/**
 * Get mentions for a kindergarten
 * @param {number} kindergartenId - Kindergarten ID
 * @param {Object} params - Pagination parameters
 * @param {string} accessToken - User access token
 */
export async function getKindergartenMentions(kindergartenId, params = {}, accessToken) {
  const queryParams = new URLSearchParams()
  
  if (params.pageNumber) queryParams.append('PageNumber', params.pageNumber)
  if (params.pageSize) queryParams.append('PageSize', params.pageSize)
  
  const queryString = queryParams.toString()
  const endpoint = `/Community/mentions/${kindergartenId}${queryString ? `?${queryString}` : ''}`
  
  return fetchAPI(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

/**
 * Create a new post
 * @param {Object} post - Post data
 * @param {string} post.content - Post content text
 * @param {number} post.kindergartenId - Related kindergarten ID (optional)
 * @param {string} post.relatedReviewId - Related review UUID (optional)
 * @param {number} post.type - Post type (0: General, 1: Question, 2: Review)
 * @param {string} accessToken - User access token
 */
export async function createPost(post, accessToken) {
  return fetchAPI('/Community/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(post)
  })
}

/**
 * Create a comment on a post
 * @param {Object} comment - Comment data
 * @param {string} comment.postId - Post UUID
 * @param {string} comment.content - Comment content
 * @param {string} comment.parentCommentId - Parent comment UUID for replies (optional)
 * @param {string} accessToken - User access token
 */
export async function createComment(comment, accessToken) {
  return fetchAPI('/Community/comments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(comment)
  })
}

/**
 * Like/unlike a post
 * @param {string} postId - Post UUID
 * @param {string} accessToken - User access token
 */
export async function likePost(postId, accessToken) {
  return fetchAPI(`/Community/posts/${postId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

/**
 * Like/unlike a comment
 * @param {string} commentId - Comment UUID
 * @param {string} accessToken - User access token
 */
export async function likeComment(commentId, accessToken) {
  return fetchAPI(`/Community/comments/${commentId}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

/**
 * Delete a post
 * @param {string} postId - Post UUID
 * @param {string} accessToken - User access token
 */
export async function deletePost(postId, accessToken) {
  return fetchAPI(`/Community/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

/**
 * Delete a comment
 * @param {string} commentId - Comment UUID
 * @param {string} accessToken - User access token
 */
export async function deleteComment(commentId, accessToken) {
  return fetchAPI(`/Community/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
}

export default {
  // Authentication
  authWithGoogle,
  authWithInstagram,
  authWithTelegram,
  loginWithPassword,
  registerParent,
  getCurrentUser,
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
  // Community (7 mahalla)
  getCommunityFeed,
  getPostComments,
  getKindergartenMentions,
  createPost,
  createComment,
  likePost,
  likeComment,
  deletePost,
  deleteComment,
  // Enums
  Features,
  LanguagesEnum,
  WorkingDaysOfWeek,
  Meals
}
