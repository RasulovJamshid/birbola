'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle, Heart, Send, Trash2, MoreVertical,
  Search, Plus, X, AlertCircle, CheckCircle2,
  ChevronRight, ArrowLeft, Loader2
} from 'lucide-react'
import {
  getCommunityFeed,
  getPostComments,
  createPost,
  createComment,
  likePost,
  likeComment,
  deletePost,
  deleteComment
} from '../services/api'
import Header from './Header'
import { useRouter } from 'next/navigation'

const PostTypeLabels = {
  0: 'Umumiy',
  1: 'Savol',
  2: 'Sharh'
}

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl animate-fadeIn ${type === 'error'
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      }`}>
      {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </div>
  )
}

const SkeletonPost = () => (
  <div className="p-4 border-b border-white/5 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-white/5 rounded" />
          <div className="h-4 w-12 bg-white/5 rounded-full" />
        </div>
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-2/3 bg-white/5 rounded" />
      </div>
    </div>
  </div>
)

const CommunityFeed = () => {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverError, setServerError] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Scroll hide state
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const lastScrollYRef = useRef(0)

  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop
    if (currentScrollY > lastScrollYRef.current && currentScrollY > 50) {
      if (!isHeaderHidden) setIsHeaderHidden(true)
    } else if (currentScrollY < lastScrollYRef.current) {
      if (isHeaderHidden) setIsHeaderHidden(false)
    }
    lastScrollYRef.current = currentScrollY
  }

  // Toasts
  const [toasts, setToasts] = useState([])

  // Filters
  const [activeTab, setActiveTab] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(0)

  // Form states
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostType, setNewPostType] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')

  // Login prompt
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptMessage, setLoginPromptMessage] = useState('')

  const commentsEndRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1 })

    if (headerRef.current) observer.observe(headerRef.current)
    if (contentRef.current) observer.observe(contentRef.current)
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current)
      if (contentRef.current) observer.unobserve(contentRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      setAccessToken(token)
      setIsLoggedIn(!!token)
      const userData = localStorage.getItem('user')
      if (userData) {
        try { setUser(JSON.parse(userData)) } catch (e) { console.error(e) }
      }
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [accessToken, activeTab, sortBy])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const fetchPosts = async () => {
    if (!accessToken) {
      const fallbackThreads = [
        { id: 1, authorName: 'Malika Karimova', type: 1, content: "Farzandim uchun eng yaxshi bog'cha tanlashda nimalarga e'tibor berishim kerak?", commentsCount: 5, likesCount: 12, createdAt: new Date().toISOString() },
        { id: 2, authorName: 'Jasur Ahmedov', type: 1, content: "Bolaning bog'chaga ko'nikish davri qancha davom etadi?", commentsCount: 8, likesCount: 24, createdAt: new Date().toISOString() }
      ]
      setPosts(fallbackThreads)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setServerError(null)
    try {
      const params = { pageNumber: 1, pageSize: 50, sort: sortBy }
      const response = await getCommunityFeed(params, accessToken)
      let data = response.items || response || []
      if (activeTab !== null) {
        data = data.filter(post => post.type === activeTab)
      }
      setPosts(data)
    } catch (err) {
      console.error('Community feed error:', err)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        setAccessToken(null)
        setUser(null)
        setIsLoggedIn(false)
        setLoginPromptMessage('Sessiya tugadi. Iltimos, qayta tizimga kiring')
        setShowLoginPrompt(true)
      } else {
        const fallbackThreads = [
          { id: 1, authorName: 'Malika Karimova', type: 1, content: "Farzandim uchun eng yaxshi bog'cha tanlashda nimalarga e'tibor berishim kerak?", commentsCount: 5, likesCount: 12, createdAt: new Date().toISOString() },
          { id: 2, authorName: 'Jasur Ahmedov', type: 1, content: "Bolaning bog'chaga ko'nikish davri qancha davom etadi?", commentsCount: 8, likesCount: 24, createdAt: new Date().toISOString() },
          { id: 3, authorName: 'Nilufar Tosheva', type: 0, content: "Bog'chamizda yangi ingliz tili darslari boshlandi. Bolalar juda qiziqmoqda!", commentsCount: 3, likesCount: 15, createdAt: new Date().toISOString() }
        ]
        setPosts(fallbackThreads)
        setServerError(err.message?.includes('500')
          ? "Server vaqtincha ishlamayapti. Namuna ma'lumotlar ko'rsatilmoqda."
          : "Tarmoq xatoligi. Namuna ma'lumotlar ko'rsatilmoqda."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    if (!accessToken) {
      if (postId === 1) {
        setComments([
          { id: 101, authorName: 'Sardor', content: 'Asosiysi tarbiyachilarning muomalasi va tajribasi.', likesCount: 3, createdAt: new Date().toISOString() },
          { id: 102, authorName: 'Guli', content: "Ovqatlanish menyusini ham tekshirib ko'ring.", likesCount: 1, createdAt: new Date().toISOString() }
        ])
      } else {
        setComments([])
      }
      return
    }
    setCommentsLoading(true)
    try {
      const response = await getPostComments(postId, 1, 100, accessToken)
      setComments(response.items || [])
    } catch (err) {
      addToast("Izohlarni yuklab bo'lmadi", 'error')
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleSelectPost = (post) => {
    setSelectedPost(post)
    fetchComments(post.id)
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setSelectedPost(null)
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!accessToken) {
      setLoginPromptMessage('Post yaratish uchun tizimga kirish kerak')
      setShowLoginPrompt(true)
      return
    }
    if (!newPostContent.trim()) return

    setIsSubmitting(true)
    try {
      await createPost({ content: newPostContent, type: newPostType }, accessToken)
      addToast('Post muvaffaqiyatli yaratildi!')
      setNewPostContent('')
      setNewPostType(1)
      setShowCreatePost(false)
      await fetchPosts()
    } catch (err) {
      addToast('Post yaratishda xatolik yuz berdi', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateComment = async (e) => {
    e.preventDefault()
    if (!accessToken) {
      setLoginPromptMessage('Izoh qoldirish uchun tizimga kirish kerak')
      setShowLoginPrompt(true)
      return
    }
    if (!newCommentContent.trim() || !selectedPost) return

    setIsSubmitting(true)
    try {
      await createComment({ postId: selectedPost.id, content: newCommentContent }, accessToken)
      setNewCommentContent('')
      addToast("Izohingiz qo'shildi")
      fetchComments(selectedPost.id)
    } catch (err) {
      addToast('Izoh qoldirishda xatolik', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikePost = async (postId) => {
    if (!accessToken) {
      setLoginPromptMessage('Reaksiya qoldirish uchun tizimga kirish kerak')
      setShowLoginPrompt(true)
      return
    }
    try {
      await likePost(postId, accessToken)
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1,
        isLikedByMe: !p.isLikedByMe
      } : p))
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          likesCount: prev.isLikedByMe ? prev.likesCount - 1 : prev.likesCount + 1,
          isLikedByMe: !prev.isLikedByMe
        }))
      }
    } catch (err) {
      addToast('Xatolik yuz berdi', 'error')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Hozirgincha'
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
  }

  const handleRetry = () => {
    fetchPosts()
  }

  return (
    <div className={`community-page-wrapper selection:bg-[#d946ef]/30 fixed inset-0 overflow-hidden flex flex-col bg-[#090318] ${selectedPost ? 'is-post-selected' : ''}`}>
      <div className="community-aurora-top" />
      <div className="community-aurora-bottom" />
      <div className="community-header">
        <Header className="!static !bg-transparent !backdrop-blur-0 !border-none !p-0" isHiddenProp={false} isTransparentInitially={false} />
      </div>
      <main className="community-content">
        <aside className="community-sidebar">
          <div className="sidebar-header-section">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-white italic">7 <span className="text-[#d946ef]">Mahalla</span></h1>
              <button onClick={() => isLoggedIn ? setShowCreatePost(true) : router.push('/signin')} className="p-2 bg-[#d946ef] text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                <Plus size={20} />
              </button>
            </div>
            <div className="community-tabs">
              {[{ label: 'Barchasi', value: null }, { label: 'Savol', value: 1 }, { label: 'Umumiy', value: 0 }].map((tab) => (
                <button key={tab.label} onClick={() => setActiveTab(tab.value)} className={`community-tab ${activeTab === tab.value ? 'is-active' : ''}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="community-search-bar group">
              <Search className="text-white/40 group-focus-within:text-[#d946ef] transition-colors" size={18} />
              <input type="text" placeholder="Jamiyatdan izlash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="community-list-wrapper custom-scrollbar">
            <ul className="community-list">
              {loading ? Array(5).fill(0).map((_, i) => <SkeletonPost key={i} />) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/20 p-8 text-center">
                  <MessageCircle size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Hozircha hech narsa yo'q</p>
                </div>
              ) : posts.filter(p => !searchQuery || p.content?.toLowerCase().includes(searchQuery.toLowerCase())).map(post => (
                <li key={post.id} onClick={() => handleSelectPost(post)} className={`community-list-item ${selectedPost?.id === post.id ? 'is-active' : ''}`}>
                  <div className="community-list-avatar flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d946ef]/20 to-[#c026d3]/20 flex items-center justify-center border border-white/10 overflow-hidden shadow-lg">
                      {post.authorPhoto ? <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" /> : <span className="text-[#d946ef] font-black text-lg">{post.authorName?.[0] || 'U'}</span>}
                    </div>
                  </div>
                  <div className="community-list-content flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="community-list-name truncate mr-2">{post.authorName || 'Anonim'}</span>
                      <span className="community-list-role flex-shrink-0">{PostTypeLabels[post.type] || 'Umumiy'}</span>
                    </div>
                    <p className="community-list-preview">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded">
                        <MessageCircle size={10} className="text-[#d946ef]" /> {post.commentsCount || 0}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded">
                        <Heart size={10} className="text-rose-500" /> {post.likesCount || 0}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="community-chat">
          {selectedPost ? (
            <>
              <div className="chat-header">
                <div className="flex items-center gap-4">
                  <button onClick={handleBackToList} className="p-2 lg:hidden bg-white/5 rounded-lg mr-1">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d946ef]/20 to-[#c026d3]/20 flex items-center justify-center border border-white/10 shadow-lg">
                    {selectedPost.authorPhoto ? <img src={selectedPost.authorPhoto} alt="" className="w-full h-full rounded-xl object-cover" /> : <span className="text-[#d946ef] font-black text-xl">{selectedPost.authorName?.[0] || 'U'}</span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-0.5">
                      <h3 className="text-white font-black text-base">{selectedPost.authorName || 'Anonim'}</h3>
                      <span className="px-2 py-0.5 bg-[#d946ef]/10 text-[#d946ef] text-[9px] font-black uppercase rounded-full border border-[#d946ef]/20">{PostTypeLabels[selectedPost.type] || 'Umumiy'}</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-medium">{formatDate(selectedPost.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPost.authorId === user?.userId && (
                    <button onClick={() => { if (confirm("O'chirilsinmi?")) deletePost(selectedPost.id, accessToken).then(fetchPosts) }} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button onClick={() => handleLikePost(selectedPost.id)} className={`p-2 rounded-xl transition-all ${selectedPost.isLikedByMe ? 'text-red-500' : 'text-white/40 hover:text-white'}`}>
                    <Heart size={20} className={selectedPost.isLikedByMe ? 'fill-red-500' : ''} />
                  </button>
                </div>
              </div>
              <div className="chat-messages custom-scrollbar">
                {serverError && (
                  <div className="flex items-center gap-3 px-5 py-3 mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-sm text-amber-300 text-sm font-medium animate-fadeIn relative">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span className="flex-1">{serverError}</span>
                    <button onClick={handleRetry} className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                      <Loader2 size={12} className={loading ? 'animate-spin' : ''} /> Qayta
                    </button>
                  </div>
                )}
                {!isLoggedIn && (
                  <div className="mb-8 p-6 bg-[#d946ef]/10 border border-[#d946ef]/20 rounded-3xl flex items-center justify-between gap-6 animate-pulse">
                    <div><p className="text-white font-bold mb-1 text-sm">Hamjamiyatga qo'shiling!</p><p className="text-white/50 text-xs">Savollar berish va fikr qoldirish uchun tizimga kiring.</p></div>
                    <button onClick={() => router.push('/signin')} className="btn-primary btn-sm px-6 text-xs">Kirish</button>
                  </div>
                )}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 mb-10 backdrop-blur-sm">
                  <p className="text-white text-xl md:text-2xl font-medium leading-relaxed">{selectedPost.content}</p>
                  <div className="flex items-center gap-4 mt-6 text-white/40 text-sm font-bold">
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full"><Heart size={16} /> {selectedPost.likesCount || 0}</span>
                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full"><MessageCircle size={16} /> {comments.length} izoh</span>
                  </div>
                </div>
                <div className="space-y-6 relative">
                  <div className="absolute top-0 right-0 z-50 flex flex-col gap-2 pointer-events-none">
                    {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#d946ef] uppercase tracking-wider mb-8">
                    <span className="w-2 h-2 rounded-full bg-[#d946ef] shadow-[0_0_10px_#d946ef]" /> Fikrlar ({comments.length})
                  </div>
                  {commentsLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#d946ef]" size={32} /></div> : comments.length === 0 ? <div className="text-center py-12 text-white/20 italic text-sm">Hali fikrlar yo'q...</div> : comments.map(comment => (
                    <div key={comment.id} className="flex gap-4 group animate-fadeIn">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                        {comment.authorPhoto ? <img src={comment.authorPhoto} alt="" className="w-full h-full rounded-lg object-cover" /> : <span className="text-white/40 font-bold text-xs">{comment.authorName?.[0] || 'U'}</span>}
                      </div>
                      <div className="flex-1 bg-white/[0.03] p-4 rounded-2xl border border-white/5 group-hover:bg-white/[0.05] transition-all relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-white font-black text-xs">{comment.authorName || 'Anonim'}</span>
                          <span className="text-white/20 text-[9px] font-bold uppercase">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed mb-3">{comment.content}</p>
                        <div className="flex items-center justify-between">
                          <button onClick={() => isLoggedIn ? likeComment(comment.id, accessToken).then(() => fetchComments(selectedPost.id)) : router.push('/signin')} className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${comment.isLikedByMe ? 'text-red-400' : 'text-white/20 hover:text-white/60'}`}>
                            <Heart size={12} className={comment.isLikedByMe ? 'fill-red-500' : ''} /> {comment.likesCount || 0}
                          </button>
                          {comment.authorId === user?.userId && (
                            <button onClick={() => deleteComment(comment.id, accessToken).then(() => fetchComments(selectedPost.id))} className="text-white/10 hover:text-red-400 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
              </div>
              <div className="chat-input-wrapper">
                <form onSubmit={handleCreateComment} className="chat-input-inner focus-within:border-[#d946ef]/50 transition-all">
                  <input type="text" value={newCommentContent} onChange={(e) => setNewCommentContent(e.target.value)} placeholder={isLoggedIn ? "Fikringizni qoldiring..." : "Fikr qoldirish uchun tizimga kiring"} disabled={!isLoggedIn} />
                  <button type="submit" disabled={isSubmitting || !newCommentContent.trim() || !isLoggedIn} className="chat-send-btn disabled:opacity-50 disabled:scale-100">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6"><ArrowLeft size={32} className="text-white/20" /></div>
              <h3 className="text-xl font-bold text-white mb-2">Suhbatga qo'shiling</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto">Chap tomondagi ro'yxatdan postni tanlang yoki o'zingiz yangi mavzu oching</p>
            </div>
          )}
        </div>
      </main>
      {showCreatePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090318]/90 backdrop-blur-md" onClick={() => setShowCreatePost(false)} />
          <div className="relative w-full max-w-xl bg-[#1b1235] border border-white/10 rounded-[40px] shadow-3xl overflow-hidden animate-fadeIn">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-white italic">Yangi <span className="text-[#d946ef]">Post</span></h2>
                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[{ val: 0, label: 'Umumiy' }, { val: 1, label: 'Savol' }, { val: 2, label: 'Sharh' }].map(t => (
                    <button key={t.val} type="button" onClick={() => setNewPostType(t.val)} className={`py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${newPostType === t.val ? 'bg-[#d946ef] border-[#d946ef] text-white shadow-lg shadow-[#d946ef]/20' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Nima haqida gaplashamiz?" rows={6} className="w-full p-6 bg-white/5 border border-white/5 rounded-[32px] text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all resize-none text-lg" required />
                <button type="submit" disabled={isSubmitting || !newPostContent.trim()} className="w-full py-5 bg-white text-black font-black text-lg rounded-[28px] shadow-2xl hover:bg-white/90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={24} />} Chop etish
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl animate-fadeIn">
            <div className="w-20 h-20 bg-[#d946ef]/10 rounded-3xl flex items-center justify-center mx-auto mb-6"><span className="text-4xl">🔐</span></div>
            <h3 className="text-2xl font-black text-[#090318] mb-3 tracking-tight">Tizimga kiring</h3>
            <p className="text-[#090318]/60 font-medium mb-8 leading-relaxed">{loginPromptMessage}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/signin')} className="w-full py-4 bg-[#d946ef] text-white font-black rounded-2xl shadow-xl shadow-[#d946ef]/20 hover:scale-[1.02] active:scale-95 transition-all">Kirish →</button>
              <button onClick={() => setShowLoginPrompt(false)} className="w-full py-4 text-[#090318]/40 font-bold hover:text-[#090318]/70 transition-colors">Bekor qilish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityFeed
