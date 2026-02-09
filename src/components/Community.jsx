'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getCommunityFeed, 
  getPostComments, 
  createComment, 
  likePost, 
  likeComment
} from '../services/api'

// Assets now served from public folder
const AccountIcon = '/assets/community/account.svg'
const FemaleIcon = '/assets/community/female.svg'
const LikeIcon = '/assets/community/like.svg'
const ReplyIcon = '/assets/community/reply.svg'
const OptionsIcon = '/assets/community/options.svg'
const SearchIcon = '/assets/community/search.svg'
const SendIcon = '/assets/community/send.svg'

const PostTypeLabels = {
  0: 'Umumiy',
  1: 'Savol',
  2: 'Sharh'
}

const tabs = ["Barchasi", "Savol", "Umumiy", "Sharh"]

const Community = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("Barchasi")
  const [selectedThread, setSelectedThread] = useState(null)
  const [threads, setThreads] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptMessage, setLoginPromptMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      setAccessToken(token)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [activeTab, accessToken])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      // For home page, we can show posts without auth (read-only)
      // But we'll need auth for writing
      const params = {
        pageNumber: 1,
        pageSize: 5, // Show only 5 posts on home page
        sort: 0 // Recent
      }
      
      // If we have a token, use it, otherwise fetch without auth (if API allows)
      let response
      if (accessToken) {
        response = await getCommunityFeed(params, accessToken)
      } else {
        // Try to fetch without auth - if API requires auth, this will fail gracefully
        try {
          response = await getCommunityFeed(params, 'guest')
        } catch (err) {
          // If API requires auth, show empty state
          setThreads([])
          setLoading(false)
          return
        }
      }
      
      let filteredPosts = response.items || response || []
      
      // Filter by post type if tab is selected
      if (activeTab === "Savol") {
        filteredPosts = filteredPosts.filter(post => post.type === 1)
      } else if (activeTab === "Umumiy") {
        filteredPosts = filteredPosts.filter(post => post.type === 0)
      } else if (activeTab === "Sharh") {
        filteredPosts = filteredPosts.filter(post => post.type === 2)
      }
      
      // Transform to match the old format
      const transformedThreads = filteredPosts.map(post => ({
        id: post.id,
        author: post.authorName || 'Anonim',
        role: 'Ona',
        tag: PostTypeLabels[post.type] || 'Umumiy',
        content: post.content,
        date: new Date(post.createdAt).toLocaleDateString('uz-UZ'),
        comments: post.commentsCount || 0,
        likes: post.likesCount || 0,
        isLikedByMe: post.isLikedByMe,
        authorPhoto: post.authorPhoto
      }))
      
      setThreads(transformedThreads)
      
      // Auto-select first thread
      if (transformedThreads.length > 0 && !selectedThread) {
        setSelectedThread(transformedThreads[0].id)
        fetchComments(transformedThreads[0].id)
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
      setThreads([])
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    if (!accessToken) {
      setMessages([])
      return
    }
    
    try {
      const response = await getPostComments(postId, 1, 10, accessToken)
      const comments = response.items || []
      
      // Transform to match old format
      const transformedMessages = comments.map(comment => ({
        id: comment.id,
        author: comment.authorName || 'Anonim',
        role: 'Ona',
        content: comment.content,
        date: new Date(comment.createdAt).toLocaleDateString('uz-UZ'),
        likes: comment.likesCount || 0,
        isLikedByMe: comment.isLikedByMe,
        isHighlighted: false,
        authorPhoto: comment.authorPhoto
      }))
      
      setMessages(transformedMessages)
    } catch (err) {
      console.error('Error fetching comments:', err)
      setMessages([])
    }
  }

  const handleSelectThread = (threadId) => {
    setSelectedThread(threadId)
    fetchComments(threadId)
  }

  const handleSendComment = async (e) => {
    e.preventDefault()
    
    // Require authentication for writing
    if (!accessToken) {
      setLoginPromptMessage('Izoh qoldirish uchun tizimga kirish kerak')
      setShowLoginPrompt(true)
      return
    }
    
    if (!newCommentContent.trim() || !selectedThread) return
    
    try {
      await createComment({
        postId: selectedThread,
        content: newCommentContent
      }, accessToken)
      
      setNewCommentContent('')
      fetchComments(selectedThread)
    } catch (err) {
      console.error('Error creating comment:', err)
      // Check if it's an auth error
      if (err.message.includes('401')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_token')
        setAccessToken(null)
        setLoginPromptMessage('Sessiyangiz tugagan. Qaytadan tizimga kirishingiz kerak')
        setShowLoginPrompt(true)
      } else {
        alert('Izoh qo\'shishda xatolik yuz berdi')
      }
    }
  }

  const handleLikePost = async (postId) => {
    if (!accessToken) {
      setLoginPromptMessage('Like qo\'yish uchun tizimga kirish kerak')
      setShowLoginPrompt(true)
      return
    }
    
    try {
      await likePost(postId, accessToken)
      fetchPosts()
    } catch (err) {
      console.error('Error liking post:', err)
      if (err.message.includes('401')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_token')
        setAccessToken(null)
        setLoginPromptMessage('Sessiyangiz tugagan. Qaytadan tizimga kirishingiz kerak')
        setShowLoginPrompt(true)
      }
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!accessToken) {
      setLoginPromptMessage('Like qo\'yish uchun tizimga kirish kerak')
      setShowLoginPrompt(true)
      return
    }
    
    try {
      await likeComment(commentId, accessToken)
      fetchComments(selectedThread)
    } catch (err) {
      console.error('Error liking comment:', err)
      if (err.message.includes('401')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_token')
        setAccessToken(null)
        setLoginPromptMessage('Sessiyangiz tugagan. Qaytadan tizimga kirishingiz kerak')
        setShowLoginPrompt(true)
      }
    }
  }

  const currentThread = threads.find(t => t.id === selectedThread)

  return (
    <section className="community-page relative overflow-hidden">
      {/* Background Effects */}
      <div className="section-glow top-0 right-0 glow-blue opacity-20 w-[800px] h-[800px] blur-[100px]" />
      <div className="section-glow bottom-0 left-0 glow-pink opacity-20 w-[600px] h-[600px] blur-[80px]" />

      <div className="community-inner relative z-10">
        {/* Header */}
        <header className="community-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0 }}>
            <span>7 mahalla</span>
            <span className="community-pill">Comunity</span>
            <span className="community-icon">💬</span>
          </h1>
          <button
            onClick={() => router.push('/community')}
            className="community-view-all"
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: '#ff9300',
              border: '2px solid #ff9300',
              borderRadius: '999px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ff9300'
              e.target.style.color = 'white'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#ff9300'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Barchasini ko'rish
            <span style={{ fontSize: '16px' }}>→</span>
          </button>
        </header>

        {/* Main Content Card */}
        <div className="community-content">
          {/* Sidebar */}
          <aside className="community-sidebar">
            {/* Tabs */}
            <div className="community-tabs">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`community-tab ${tab === activeTab ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="community-search-bar">
              <img src={SearchIcon} alt="Search" className="community-search-icon" />
              <input type="text" placeholder="Izlash" />
            </div>

            {/* Thread List */}
            <ul className="community-list">
              {loading ? (
                <li className="community-list-item" style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: '14px' }}>
                  Yuklanmoqda...
                </li>
              ) : threads.length === 0 ? (
                <li className="community-list-item" style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: '14px' }}>
                  Hozircha postlar yo'q
                </li>
              ) : (
                threads.map(thread => (
                  <li
                    key={thread.id}
                    className={`community-list-item ${thread.id === selectedThread ? 'is-active' : ''}`}
                    onClick={() => handleSelectThread(thread.id)}
                  >
                    <div className="community-list-avatar">
                      <img src={AccountIcon} alt={thread.author} />
                    </div>
                    <div className="community-list-content">
                      <div className="community-list-header">
                        <span className="community-list-name">{thread.author}</span>
                        <span className="community-list-role">
                          {thread.role} <img src={FemaleIcon} alt="" className="role-icon" />
                        </span>
                      </div>
                      <div className="community-list-tag">{thread.tag}</div>
                      <p className="community-list-preview">{thread.content}</p>
                      <div className="community-list-meta">
                        <span className="meta-comments">
                          <span className="meta-badge">{thread.comments} ta</span>
                        </span>
                        <span className="meta-likes">
                          <img src={LikeIcon} alt="Likes" /> {thread.likes} ta
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </aside>

          {/* Thread View */}
          <main className="community-thread">
            {currentThread && (
              <>
                {/* Thread Header */}
                <div className="thread-header">
                  <div className="thread-avatar">
                    <img src={AccountIcon} alt={currentThread.author} />
                  </div>
                  <div className="thread-header-main">
                    <div className="thread-header-top">
                      <span className="thread-author">{currentThread.author}</span>
                      <span className="thread-role">
                        {currentThread.role} <img src={FemaleIcon} alt="" className="role-icon" />
                      </span>
                      <span className="thread-tag">{currentThread.tag}</span>
                    </div>
                    <div className="thread-date">{currentThread.date}</div>
                  </div>
                  <button className="thread-menu">
                    <img src={OptionsIcon} alt="Options" />
                  </button>
                </div>

                {/* Thread Question */}
                <div className="thread-question">
                  <p className="thread-question-text">{currentThread.content}</p>
                  <div className="thread-question-meta">
                    <span className="meta-comments">{currentThread.comments} ta</span>
                    <button 
                      onClick={() => handleLikePost(currentThread.id)}
                      className="meta-likes"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <img src={LikeIcon} alt="Likes" style={{ opacity: currentThread.isLikedByMe ? 1 : 0.6 }} /> {currentThread.likes} ta
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="thread-messages">
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999', fontSize: '14px' }}>
                      {accessToken ? 'Hali izohlar yo\'q. Birinchi bo\'lib izoh qoldiring!' : 'Izohlarni ko\'rish uchun tizimga kiring'}
                    </div>
                  ) : (
                    messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`thread-message ${msg.isHighlighted ? 'is-highlighted' : ''}`}
                    >
                      <div className="thread-message-avatar">
                        <img src={AccountIcon} alt={msg.author} />
                      </div>
                      <div className="thread-message-bubble">
                        <div className="thread-message-header">
                          <span className="thread-message-author">{msg.author}</span>
                          <span className="thread-message-role">
                            {msg.role} <img src={FemaleIcon} alt="" className="role-icon" />
                          </span>
                        </div>
                        <p className="thread-message-content">{msg.content}</p>
                        <div className="thread-message-footer">
                          <span className="thread-message-date">{msg.date}</span>
                          <div className="thread-message-actions">
                            {msg.likes > 0 && (
                              <span className="meta-comments">{msg.likes > 1 ? `1 ta` : ''}</span>
                            )}
                            <button
                              onClick={() => handleLikeComment(msg.id)}
                              className="meta-likes"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              {msg.likes} ta <img src={LikeIcon} alt="Likes" style={{ opacity: msg.isLikedByMe ? 1 : 0.6 }} />
                            </button>
                            <button className="action-reply">
                              <img src={ReplyIcon} alt="Reply" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button className="thread-message-menu">
                        <img src={OptionsIcon} alt="Options" />
                      </button>
                    </div>
                  ))
                  )}
                </div>

                {/* Input */}
                <form className="thread-input" onSubmit={handleSendComment}>
                  <span className="thread-input-plus">+</span>
                  <input 
                    type="text" 
                    placeholder={accessToken ? "Xabar qoldirish" : "Izoh qoldirish uchun tizimga kiring"}
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    disabled={!accessToken}
                  />
                  <button type="submit" className="thread-send" disabled={!accessToken}>
                    <img src={SendIcon} alt="Send" />
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Beautiful Login Prompt Modal */}
      {showLoginPrompt && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowLoginPrompt(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f9f9ff 100%)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff9300 0%, #ffb84d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '32px'
            }}>
              🔐
            </div>

            {/* Message */}
            <h3 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#1a1a2e',
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              Tizimga kirish kerak
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#666',
              textAlign: 'center',
              marginBottom: '28px',
              lineHeight: '1.6'
            }}>
              {loginPromptMessage}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  background: 'white',
                  color: '#666',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#ff9300'
                  e.target.style.color = '#ff9300'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.color = '#666'
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false)
                  router.push('/signin')
                }}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff9300 0%, #ffb84d 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 147, 0, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(255, 147, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 147, 0, 0.3)'
                }}
              >
                Kirish →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Community
