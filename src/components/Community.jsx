'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronRight, 
  MessageSquare, 
  Send, 
  Heart, 
  Search, 
  User, 
  Loader2,
  Plus
} from 'lucide-react'
import { 
  getCommunityFeed, 
  getPostComments, 
  createComment, 
  likePost, 
  likeComment 
} from '../services/api'

const Community = () => {
  const router = useRouter()
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const [activeTab, setActiveTab] = useState('Barchasi')

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }, { threshold: 0.1 })

    if (headerRef.current) observer.observe(headerRef.current)
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current)
      if (sectionRef.current) observer.unobserve(sectionRef.current)
    }
  }, [])
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(false)
  const [accessToken, setAccessToken] = useState(null)
  const [commentText, setCommentText] = useState('')

  const tabs = ['Barchasi', 'Mashhur', 'Yangi', 'Mening savollarim']

  useEffect(() => {
    let token = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken')
      setAccessToken(token)
    }
    fetchPosts(token)
  }, [])

  const fetchPosts = async (token) => {
    setLoading(true)
    try {
      const data = await getCommunityFeed({ pageSize: 10 }, token)
      const threadList = Array.isArray(data) ? data : data?.data || data?.items || []
      
      // Fallback data for design preview if API fails or returns empty
      const fallbackThreads = [
        { id: 1, author: 'Malika Karimova', role: 'Ota-ona', tag: 'Maslahat', content: 'Farzandim uchun eng yaxshi bog\'cha tanlashda nimalarga e\'tibor berishim kerak?', comments: 5, likes: 12 },
        { id: 2, author: 'Jasur Ahmedov', role: 'Mutaxassis', tag: 'Psixologiya', content: 'Bolaning bog\'chaga ko\'nikish davri qancha davom etadi?', comments: 8, likes: 24 }
      ]

      const finalThreads = threadList.length > 0 ? threadList : fallbackThreads
      setThreads(finalThreads)
      
      const firstId = finalThreads[0].id
      setSelectedThread(firstId)
      fetchComments(firstId, token)
    } catch (err) {
      console.error('Error fetching threads:', err)
      const fallbackThreads = [
        { id: 1, author: 'Malika Karimova', role: 'Ota-ona', tag: 'Maslahat', content: 'Farzandim uchun eng yaxshi bog\'cha tanlashda nimalarga e\'tibor berishim kerak?', comments: 5, likes: 12 },
        { id: 2, author: 'Jasur Ahmedov', role: 'Mutaxassis', tag: 'Psixologiya', content: 'Bolaning bog\'chaga ko\'nikish davri qancha davom etadi?', comments: 8, likes: 24 }
      ]
      setThreads(fallbackThreads)
      setSelectedThread(1)
      setComments([
        { id: 101, authorName: 'Sardor', commentText: 'Asosiysi tarbiyachilarning muomalasi va tajribasi.', likes: 3 },
        { id: 102, authorName: 'Guli', commentText: 'Ovqatlanish menyusini ham tekshirib ko\'ring.', likes: 1 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (threadId, token) => {
    setLoadingComments(true)
    try {
      const data = await getPostComments(threadId, 1, 50, token)
      setComments(Array.isArray(data) ? data : data?.data || data?.items || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      if (threadId === 1) {
        setComments([
          { id: 101, authorName: 'Sardor', commentText: 'Asosiysi tarbiyachilarning muomalasi va tajribasi.', likes: 3 },
          { id: 102, authorName: 'Guli', commentText: 'Ovqatlanish menyusini ham tekshirib ko\'ring.', likes: 1 }
        ])
      }
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSelectThread = (id) => {
    setSelectedThread(id)
    fetchComments(id, accessToken)
  }

  const handleSendComment = async (e) => {
    e.preventDefault()
    if (!accessToken || !commentText.trim() || !selectedThread) return

    try {
      await createComment({
        threadId: selectedThread,
        commentText: commentText.trim()
      }, accessToken)
      setCommentText('')
      fetchComments(selectedThread)
    } catch (err) {
      console.error('Error creating comment:', err)
    }
  }

  const handleLikePost = async (postId) => {
    if (!accessToken) return
    try {
      await likePost(postId, accessToken)
      fetchPosts()
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!accessToken) return
    try {
      await likeComment(commentId, accessToken)
      fetchComments(selectedThread)
    } catch (err) {
      console.error('Error liking comment:', err)
    }
  }

  const currentThread = threads.find(t => t.id === selectedThread)

  return (
    <section className="community-section z-10 relative">
      {/* Background Aurora Effects */}
      <div className="community-aurora-top" />
      <div className="community-aurora-bottom" />

      <div className="site-container relative z-10 flex flex-col h-full">
        {/* Header */}
        <header ref={headerRef} className="community-header flex justify-between items-center reveal-on-scroll">
          <h1 className="flex items-center gap-4 text-3xl font-black text-white">
            7 mahalla
            <span className="community-pill">Community</span>
            <span className="community-icon">💬</span>
          </h1>
          <button
            onClick={() => router.push('/community')}
            className="btn-secondary !px-8 !py-3 !text-sm"
          >
            Barchasini ko'rish
            <ChevronRight size={18} />
          </button>
        </header>

        {/* Main Content Card */}
        <div ref={sectionRef} className="community-content reveal-on-scroll !min-h-[600px] !flex-none !overflow-visible">
          {/* Sidebar */}
          <aside className="community-sidebar !h-[600px]">
            <div className="sidebar-header-section">
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
              <div className="community-search-bar group">
                <Search className="text-white/40 group-focus-within:text-[#d946ef] transition-colors" size={18} />
                <input type="text" placeholder="Izlash..." className="bg-transparent text-white focus:outline-none w-full" />
              </div>
            </div>

            {/* Thread List */}
            <div className="community-list-wrapper custom-scrollbar">
              <ul className="community-list">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#d946ef]" />
                    <p className="text-sm font-medium">Yuklanmoqda...</p>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="text-center py-20 text-white/30 italic text-sm">
                    Hozircha postlar yo'q
                  </div>
                ) : (
                  threads.map(thread => (
                    <li
                      key={thread.id}
                      className={`community-list-item ${thread.id === selectedThread ? 'is-active' : ''}`}
                      onClick={() => handleSelectThread(thread.id)}
                    >
                      <div className="community-list-avatar flex-shrink-0">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 overflow-hidden">
                          <User size={18} className="text-white/40" />
                        </div>
                      </div>
                      <div className="community-list-content flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="community-list-name truncate mr-2">{thread.author}</span>
                          <span className="community-list-role flex-shrink-0">{thread.role}</span>
                        </div>
                        <div className="community-list-tag">#{thread.tag}</div>
                        <p className="community-list-preview">{thread.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded">
                            <MessageSquare size={10} className="text-[#d946ef]" />
                            {thread.comments}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded">
                            <Heart size={10} className="text-rose-500" />
                            {thread.likes}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </aside>

          {/* Chat Main View */}
          <div className="community-chat flex-1 flex flex-col !h-[600px]">
            {currentThread ? (
              <>
                <div className="chat-header flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#d946ef]/10 border border-[#d946ef]/20 flex items-center justify-center text-[#d946ef]">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white leading-tight">{currentThread.author}ning posti</h3>
                      <p className="text-xs text-gray-500 font-medium">Mavzu: {currentThread.tag}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleLikePost(currentThread.id)}
                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-rose-500 transition-all"
                  >
                    <Heart size={20} className={currentThread.isLikedByMe ? 'fill-rose-500 text-rose-500' : ''} />
                  </button>
                </div>

                <div className="chat-messages flex-1 overflow-y-auto custom-scrollbar">
                  {/* Original Post */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
                    <p className="text-gray-200 leading-relaxed">{currentThread.content}</p>
                  </div>

                  {/* Comments */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#d946ef] uppercase tracking-wider mb-4">
                      <span className="w-2 h-2 rounded-full bg-[#d946ef] shadow-[0_0_10px_#d946ef]" />
                      Fikrlar ({comments.length})
                    </div>
                    
                    {loadingComments ? (
                      <div className="flex justify-center py-12 opacity-30"><Loader2 className="animate-spin text-[#d946ef]" /></div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-12 text-white/20 italic text-sm">Hali fikrlar yo'q</div>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                            <User size={16} className="text-white/40" />
                          </div>
                          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/[0.08]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-white">{comment.authorName}</span>
                              <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-500 transition-colors">
                                <Heart size={12} className={comment.isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                                <span className="font-bold">{comment.likes}</span>
                              </button>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">{comment.commentText}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="chat-input-wrapper flex-shrink-0">
                  <form onSubmit={handleSendComment} className="chat-input-inner focus-within:border-[#d946ef]/50 transition-all">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Fikringizni qoldiring..." 
                    />
                    <button type="submit" className="chat-send-btn disabled:opacity-50 disabled:cursor-not-allowed" disabled={!commentText.trim()}>
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/20 text-center px-8">
                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 shadow-2xl">
                  <MessageSquare size={40} className="opacity-10" />
                </div>
                <p className="text-xl font-bold text-white/40 tracking-tight mb-2">Postni tanlang</p>
                <p className="text-sm font-medium leading-relaxed max-w-xs">Jamiyatdagi munozaralarni ko'rish va ishtirok etish uchun chap tomondan birini tanlang</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Community
