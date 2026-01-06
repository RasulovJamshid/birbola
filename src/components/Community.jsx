import { useState } from 'react'
import AccountIcon from '../assets/community/account.svg'
import FemaleIcon from '../assets/community/female.svg'
import LikeIcon from '../assets/community/like.svg'
import ReplyIcon from '../assets/community/reply.svg'
import OptionsIcon from '../assets/community/options.svg'
import SearchIcon from '../assets/community/search.svg'
import SendIcon from '../assets/community/send.svg'

// Sample data for threads
const threads = [
  {
    id: 1,
    author: "Diyora Keldiyorova",
    role: "Ona",
    tag: "Savol",
    content: "Barchaga salom. Men farzandimni bog'chaga bermoxchi edim. Qaysi bog'chani tafsiya qila olasizlar?",
    date: "16.06.2025",
    comments: 2,
    likes: 35
  },
  {
    id: 2,
    author: "Diyora Keldiyorova",
    role: "Ona",
    tag: "Savol",
    content: "Barchaga salom. Men farzandimni bog'chaga bermoxchi edim. Qaysi bog'chani tafsiya qila olasizlar? Barchaga salom. Men farzandimni bog'chaga bermoxchi edim. Qaysi bog'chani tafsiya qila olasizlar?",
    date: "16.06.2025",
    comments: 20,
    likes: 35
  },
  {
    id: 3,
    author: "Diyora Keldiyorova",
    role: "Ona",
    tag: "Savol",
    content: "Barchaga salom. Men farzandimni bog'chaga bermoxchi edim. Qaysi bog'chani tafsiya qila olasizlar?",
    date: "16.06.2025",
    comments: 2,
    likes: 35
  },
  {
    id: 4,
    author: "Diyora Keldiyorova",
    role: "Ona",
    tag: "Savol",
    content: "Barchaga salom.",
    date: "16.06.2025",
    comments: 2,
    likes: 35
  }
]

// Sample messages for selected thread
const messages = [
  {
    id: 1,
    author: "Shoista Gulyamova",
    role: "Ona",
    content: "Salom Diyora, men farzandimni Nutrisa bogchasiga berganman. Bogcha juda yaxshi va narxi ham hamyon bop. Bogcha erimniki bo'lgani uchun reklama qilmayapman. Chin dildan tafsiya etaman.",
    date: "16.06.2025",
    likes: 20,
    isHighlighted: false
  },
  {
    id: 2,
    author: "Shoista Gulyamova",
    role: "Ona",
    content: "Salom Diyora,",
    date: "16.06.2025",
    likes: 0,
    isHighlighted: false
  },
  {
    id: 3,
    author: "Shoista Gulyamova",
    role: "Ona",
    content: "Salom Diyora,",
    date: "16.06.2025",
    likes: 20,
    isHighlighted: false
  },
  {
    id: 4,
    author: "Shoista Gulyamova",
    role: "Ona",
    content: "Salom Diyora,",
    date: "16.06.2025",
    likes: 20,
    isHighlighted: true
  },
  {
    id: 5,
    author: "Shoista Gulyamova",
    role: "Ona",
    content: "Salom Diyora,",
    date: "16.06.2025",
    likes: 20,
    isHighlighted: false
  }
]

const tabs = ["Barchasi", "Savol", "Muammo", "E'lon"]

const Community = () => {
  const [activeTab, setActiveTab] = useState("Barchasi")
  const [selectedThread, setSelectedThread] = useState(2)

  const currentThread = threads.find(t => t.id === selectedThread)

  return (
    <section className="community-page">
      <div className="community-inner">
        {/* Header */}
        <header className="community-header">
          <h1>
            <span>7 mahalla</span>
            <span className="community-pill">Comunity</span>
            <span className="community-icon">💬</span>
          </h1>
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
              {threads.map(thread => (
                <li
                  key={thread.id}
                  className={`community-list-item ${thread.id === selectedThread ? 'is-active' : ''}`}
                  onClick={() => setSelectedThread(thread.id)}
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
              ))}
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
                    <span className="meta-likes">
                      <img src={LikeIcon} alt="Likes" /> {currentThread.likes} ta
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="thread-messages">
                  {messages.map(msg => (
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
                            <span className="meta-likes">
                              {msg.likes} ta <img src={LikeIcon} alt="Likes" />
                            </span>
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
                  ))}
                </div>

                {/* Input */}
                <form className="thread-input">
                  <span className="thread-input-plus">+</span>
                  <input type="text" placeholder="Xabar qoldirish" />
                  <button type="submit" className="thread-send">
                    <img src={SendIcon} alt="Send" />
                  </button>
                </form>
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  )
}

export default Community
