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
import Footer from './Footer'
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
    <div className={`fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl animate-fadeIn ${
      type === 'error' 
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
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      setAccessToken(token)
      const userData = localStorage.getItem('user')
      if (userData) {
        try { setUser(JSON.parse(userData)) } catch (e) { console.error(e) }
      }
    }
  }, [])

  useEffect(() => {
    if (accessToken) fetchPosts()
  }, [accessToken, activeTab, sortBy])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { pageNumber: 1, pageSize: 50, sort: sortBy }
      const response = await getCommunityFeed(params, accessToken)
      let data = response.items || response || []
      if (activeTab !== null) {
        data = data.filter(post => post.type === activeTab)
      }
      setPosts(data)
    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi')
      addToast('Postlarni yuklab bo\'lmadi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId) => {
    setCommentsLoading(true)
    try {
      const response = await getPostComments(postId, 1, 100, accessToken)
      setComments(response.items || [])
    } catch (err) {
      addToast('Izohlarni yuklab bo\'lmadi', 'error')
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
      setNewPostContent('')
      setShowCreatePost(false)
      addToast('Post muvaffaqiyatli yaratildi!')
      fetchPosts()
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
      addToast('Izohingiz qo\'shildi')
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
    if (diff < 3600) return `${Math.floor(diff/60)} daqiqa oldin`
    if (diff < 86400) return `${Math.floor(diff/3600)} soat oldin`
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen bg-[#090318] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 pt-32">
          <div className="max-w-md w-full text-center space-y-6 animate-fadeIn">
            <div className="w-24 h-24 bg-[#d946ef]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#d946ef]/20 shadow-2xl shadow-[#d946ef]/10">
              <MessageCircle size={40} className="text-[#d946ef]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">7 mahalla</h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Ota-onalar jamiyatiga qo'shiling va fikr almashing. Ma'lumotlarni ko'rish uchun tizimga kiring.
            </p>
            <button 
              onClick={() => router.push('/signin')}
              className="w-full py-4 bg-gradient-to-r from-[#d946ef] to-[#c026d3] text-white font-bold rounded-2xl shadow-xl shadow-[#d946ef]/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Kirish
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090318] text-white flex flex-col selection:bg-[#d946ef]/30">
      <Header />
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d946ef]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6366f1]/10 blur-[120px] rounded-full" />
      </div>

      <main className="flex-1 container mx-auto px-4 pt-32 pb-12 relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              7 mahalla <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#c026d3]">jamiyati</span>
            </h1>
            <p className="text-white/50 text-lg font-medium">Ota-onalar o'rtasida tajriba almashish maskani</p>
          </div>
          
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            <Plus size={20} />
            Post yaratish
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Sidebar - Feed List */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col overflow-hidden h-full shadow-2xl">
              {/* Tabs */}
              <div className="flex p-2 gap-1 border-b border-white/5">
                {[
                  { label: 'Barchasi', value: null },
                  { label: 'Savol', value: 1 },
                  { label: 'Umumiy', value: 0 }
                ].map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                      activeTab === tab.value 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="p-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#d946ef] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Jamiyatdan izlash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
              </div>

              {/* Feed List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonPost key={i} />)
                ) : posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/20 p-8 text-center">
                    <MessageCircle size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Hozircha hech narsa yo'q</p>
                  </div>
                ) : (
                  posts
                    .filter(p => !searchQuery || p.content?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(post => (
                      <div
                        key={post.id}
                        onClick={() => handleSelectPost(post)}
                        className={`p-5 border-b border-white/5 cursor-pointer transition-all group hover:bg-white/[0.04] ${
                          selectedPost?.id === post.id ? 'bg-white/[0.07] border-l-4 border-l-[#d946ef]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d946ef]/20 to-[#c026d3]/20 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg">
                            {post.authorPhoto ? (
                              <img src={post.authorPhoto} alt="" className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                              <span className="text-[#d946ef] font-black text-xl">{post.authorName?.[0] || 'U'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-white font-bold text-sm truncate">{post.authorName || 'Anonim'}</span>
                              <span className="text-[10px] font-black uppercase text-[#d946ef] bg-[#d946ef]/10 px-2 py-0.5 rounded-full">
                                {PostTypeLabels[post.type] || 'Umumiy'}
                              </span>
                            </div>
                            <p className="text-white/60 text-sm line-clamp-2 leading-relaxed mb-3">{post.content}</p>
                            <div className="flex items-center gap-4 text-xs font-bold text-white/30">
                              <span className="flex items-center gap-1.5">
                                <MessageCircle size={14} />
                                {post.commentsCount || 0}
                              </span>
                              <span className="flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                                <Heart size={14} className={post.isLikedByMe ? 'fill-red-500 text-red-500' : ''} />
                                {post.likesCount || 0}
                              </span>
                              <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Post Details */}
          <div className="lg:col-span-8 flex flex-col h-full">
            {selectedPost ? (
              <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl animate-fadeIn">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d946ef]/20 to-[#c026d3]/20 flex items-center justify-center border border-white/10 shadow-xl">
                        {selectedPost.authorPhoto ? (
                          <img src={selectedPost.authorPhoto} alt="" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-[#d946ef] font-black text-2xl">{selectedPost.authorName?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-black text-lg">{selectedPost.authorName || 'Anonim'}</h3>
                          <span className="px-3 py-1 bg-[#d946ef]/10 text-[#d946ef] text-[10px] font-black uppercase rounded-full border border-[#d946ef]/20">
                            {PostTypeLabels[selectedPost.type] || 'Umumiy'}
                          </span>
                        </div>
                        <p className="text-white/40 text-sm font-medium">{formatDate(selectedPost.createdAt)}</p>
                      </div>
                    </div>
                    
                    {selectedPost.authorId === user?.userId && (
                      <button
                        onClick={() => { if(confirm('O\'chirilsinmi?')) deletePost(selectedPost.id, accessToken).then(fetchPosts) }}
                        className="p-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-8">{selectedPost.content}</p>

                  <div className="flex items-center gap-8">
                    <button
                      onClick={() => handleLikePost(selectedPost.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl transition-all font-bold ${
                        selectedPost.isLikedByMe 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Heart size={22} className={selectedPost.isLikedByMe ? 'fill-red-500' : ''} />
                      <span>{selectedPost.likesCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-2.5 text-white/60 font-bold">
                      <MessageCircle size={22} />
                      <span>{comments.length} izoh</span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                  {commentsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="animate-spin text-[#d946ef]" size={32} />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12 text-white/20">
                      <p className="text-lg font-medium italic">Birinchi bo'lib izoh qoldiring...</p>
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="group animate-fadeIn">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                            {comment.authorPhoto ? (
                              <img src={comment.authorPhoto} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              <span className="text-white/40 font-bold">{comment.authorName?.[0] || 'U'}</span>
                            )}
                          </div>
                          <div className="flex-1 bg-white/[0.04] p-5 rounded-2xl border border-white/5 group-hover:bg-white/[0.06] transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-black text-sm">{comment.authorName || 'Anonim'}</span>
                              <span className="text-white/30 text-[10px] font-bold uppercase">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-white/80 text-sm leading-relaxed mb-3">{comment.content}</p>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => likeComment(comment.id, accessToken).then(() => fetchComments(selectedPost.id))}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                                  comment.isLikedByMe ? 'text-red-400' : 'text-white/20 hover:text-white/60'
                                }`}
                              >
                                <Heart size={14} className={comment.isLikedByMe ? 'fill-red-500' : ''} />
                                {comment.likesCount || 0}
                              </button>
                              {comment.authorId === user?.userId && (
                                <button 
                                  onClick={() => deleteComment(comment.id, accessToken).then(() => fetchComments(selectedPost.id))}
                                  className="text-white/10 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                  <form onSubmit={handleCreateComment} className="relative">
                    <input
                      type="text"
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Fikringizni yozing..."
                      className="w-full pl-6 pr-20 py-5 bg-white/5 border border-white/5 rounded-3xl text-sm placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 focus:bg-white/[0.08] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newCommentContent.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#d946ef] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#d946ef]/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white/[0.02] backdrop-blur-xl border border-white/5 border-dashed rounded-[40px] flex flex-col items-center justify-center p-12 text-center opacity-60">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <ArrowLeft size={40} className="text-white/20" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Suhbatga qo'shiling</h3>
                <p className="text-white/40 max-w-sm mx-auto">
                  Chap tomondagi ro'yxatdan postni tanlang yoki o'zingiz yangi mavzu oching
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090318]/90 backdrop-blur-md" onClick={() => setShowCreatePost(false)} />
          <div className="relative w-full max-w-xl bg-[#1b1235] border border-white/10 rounded-[40px] shadow-3xl overflow-hidden animate-fadeIn">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-white italic">Yangi <span className="text-[#d946ef]">Post</span></h2>
                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreatePost} className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 0, label: 'Umumiy' },
                    { val: 1, label: 'Savol' },
                    { val: 2, label: 'Sharh' }
                  ].map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setNewPostType(t.val)}
                      className={`py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                        newPostType === t.val 
                          ? 'bg-[#d946ef] border-[#d946ef] text-white shadow-lg shadow-[#d946ef]/20' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Nima haqida gaplashamiz?"
                  rows={6}
                  className="w-full p-6 bg-white/5 border border-white/5 rounded-[32px] text-white placeholder-white/20 focus:outline-none focus:border-[#d946ef]/50 transition-all resize-none text-lg"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !newPostContent.trim()}
                  className="w-full py-5 bg-white text-black font-black text-lg rounded-[28px] shadow-2xl hover:bg-white/90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                  Chop etish
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl animate-fadeIn">
            <div className="w-20 h-20 bg-[#d946ef]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔐</span>
            </div>
            <h3 className="text-2xl font-black text-[#090318] mb-3 tracking-tight">Tizimga kiring</h3>
            <p className="text-[#090318]/60 font-medium mb-8 leading-relaxed">{loginPromptMessage}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/signin')}
                className="w-full py-4 bg-[#d946ef] text-white font-black rounded-2xl shadow-xl shadow-[#d946ef]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Kirish →
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-4 text-[#090318]/40 font-bold hover:text-[#090318]/70 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-0 right-0 p-8 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <Footer />
    </div>
  )
}

export default CommunityFeed