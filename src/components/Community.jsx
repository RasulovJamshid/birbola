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

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[10000] px-6 py-4 rounded-2xl text-white font-semibold text-sm shadow-2xl flex items-center gap-3 animate-slideInRight max-w-md ${
      type === 'error' 
        ? 'bg-gradient-to-br from-red-500 to-red-600' 
        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    }`}>
      <span className="text-xl">{type === 'error' ? '⚠️' : '✅'}</span>
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="bg-white/20 border-none rounded-lg px-2 py-1 text-white cursor-pointer text-lg leading-none hover:bg-white/30 transition-colors"
      >
        ×
      </button>
    </div>
  )
}

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
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

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
        addToast('Izoh qo\'shishda xatolik yuz berdi', 'error')
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
      addToast('Reaksiya qo\'shildi')
    } catch (err) {
      console.error('Error liking post:', err)
      if (err.message.includes('401')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_token')
        setAccessToken(null)
        setLoginPromptMessage('Sessiyangiz tugagan. Qaytadan tizimga kirishingiz kerak')
        setShowLoginPrompt(true)
      } else {
        addToast('Xatolik yuz berdi', 'error')
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
      addToast('Reaksiya qo\'shildi')
    } catch (err) {
      console.error('Error liking comment:', err)
      if (err.message.includes('401')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user_token')
        setAccessToken(null)
        setLoginPromptMessage('Sessiyangiz tugagan. Qaytadan tizimga kirishingiz kerak')
        setShowLoginPrompt(true)
      } else {
        addToast('Xatolik yuz berdi', 'error')
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
        <header className="community-header flex justify-between items-center mb-6">
          <h1 className="m-0">
            <span>7 mahalla</span>
            <span className="community-pill">Comunity</span>
            <span className="community-icon">💬</span>
          </h1>
          <button
            onClick={() => router.push('/community')}
            className="community-view-all px-6 py-2.5 bg-transparent text-[#ff9300] border-2 border-[#ff9300] rounded-full font-semibold cursor-pointer transition-all duration-300 text-sm flex items-center gap-1.5 hover:bg-[#ff9300] hover:text-white hover:-translate-y-0.5"
          >
            Barchasini ko'rish
            <span className="text-base">→</span>
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
                <li className="community-list-item text-center p-8 text-gray-600 text-sm font-medium">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#ff9300] border-t-transparent rounded-full animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </div>
                </li>
              ) : threads.length === 0 ? (
                <li className="community-list-item text-center py-12 px-8 text-gray-600 text-sm">
                  <div className="flex flex-col items-center gap-3 opacity-60">
                    <span className="text-5xl">💬</span>
                    <span className="font-semibold">Hozircha postlar yo'q</span>
                    <span className="text-xs text-gray-500">Birinchi bo'lib post yarating!</span>
                  </div>
                </li>
              ) : (
                threads.map(thread => (
                  <li
                    key={thread.id}
                    className={`community-list-item transition-all duration-300 ${
                      thread.id === selectedThread 
                        ? 'is-active shadow-[0_4px_20px_rgba(255,147,0,0.15)] shadow-[inset_0_0_0_2px_rgba(255,147,0,0.1)]' 
                        : 'shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                    }`}
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
                      className="meta-likes bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <img src={LikeIcon} alt="Likes" className={currentThread.isLikedByMe ? 'opacity-100' : 'opacity-60'} /> {currentThread.likes} ta
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="thread-messages">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 px-8 text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-3 opacity-70">
                        <span className="text-5xl">💭</span>
                        <span className="font-semibold text-base">
                          {accessToken ? 'Hali izohlar yo\'q' : 'Izohlarni ko\'rish uchun tizimga kiring'}
                        </span>
                        {accessToken && <span className="text-xs text-gray-400">Birinchi bo\'lib izoh qoldiring!</span>}
                      </div>
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
                              className="meta-likes bg-transparent border-none cursor-pointer flex items-center gap-1"
                            >
                              {msg.likes} ta <img src={LikeIcon} alt="Likes" className={msg.isLikedByMe ? 'opacity-100' : 'opacity-60'} />
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
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div 
            className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-10 max-w-md w-[90%] shadow-2xl relative animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff9300] to-[#ffb84d] flex items-center justify-center mx-auto mb-5 text-3xl">
              🔐
            </div>

            {/* Message */}
            <h3 className="text-2xl font-bold text-[#1a1a2e] text-center mb-3">
              Tizimga kirish kerak
            </h3>
            <p className="text-base text-gray-600 text-center mb-7 leading-relaxed">
              {loginPromptMessage}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 text-sm font-semibold cursor-pointer transition-all duration-200 hover:border-[#ff9300] hover:text-[#ff9300]"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false)
                  router.push('/signin')
                }}
                className="flex-1 px-6 py-3.5 rounded-xl border-none bg-gradient-to-br from-[#ff9300] to-[#ffb84d] text-white text-sm font-semibold cursor-pointer shadow-lg shadow-[#ff9300]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#ff9300]/40"
              >
                Kirish →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          message={toast.message} 
          type={toast.type} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .community-list-item:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-2px);
        }

        .community-list-item.is-active:hover {
          box-shadow: 0 6px 24px rgba(255, 147, 0, 0.2), inset 0 0 0 2px rgba(255, 147, 0, 0.15) !important;
        }
      `}</style>
    </section>
  )
}

export default Community
