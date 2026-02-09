'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { getCurrentUser } from '../services/api'
// Assets now served from public folder
const Logo = '/assets/birbola.svg'
const ChatIcon = '/assets/banner/over-button-chat.svg'
const UserIcon = '/assets/banner/account-user.svg'

const Header = ({ className = '', enableSticky = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    if (!enableSticky) return
    
    const handleScroll = () => {
      const shouldBeSticky = window.scrollY > 20
      setIsSticky(shouldBeSticky)
      console.log('Scroll position:', window.scrollY, 'Sticky:', shouldBeSticky)
    }
    
    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enableSticky])

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        return
      }

      getCurrentUser(token)
        .then(setUser)
        .catch(() => {
          setUser(null)
        })
    }

    checkAuth()
    window.addEventListener('auth-change', checkAuth)
    return () => window.removeEventListener('auth-change', checkAuth)
  }, [])

  const handleLogout = () => {
    if (typeof window === 'undefined') return

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user_token')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className={`header ${className} ${isSticky ? 'is-sticky' : ''}`}>
      <div className="header-inner">
        {/* Logo */}
        <div className="header-left">
          <Link href="/" className="logo">
            <Image src={Logo} alt="Birbola" width={120} height={40} priority />
          </Link>
        </div>



        {/* Right side utilities */}
        <div className="header-right">
          {/* Desktop Navigation */}
          <nav className="header-nav">
            <Link href="/about" className="nav-link flex items-center gap-2">
              Biz haqimizda
            </Link>
            <Link href="/search" className="nav-link flex items-center gap-2">
              Bog'chalar
            </Link>
            <Link href="/community" className="nav-pill">
              7 mahalla
              <div className="nav-pill-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10C22 14.4183 17.5228 18 12 18C10.9704 18 9.98297 17.8529 9.05742 17.5806C8.63468 17.4563 8.18348 17.4436 7.75336 17.5442L4.54581 18.2941C3.97441 18.4277 3.47953 17.8863 3.66442 17.3323L4.52208 14.7621C4.66172 14.3437 4.65487 13.8893 4.5024 13.4764C3.54125 12.4411 3 11.2666 3 10C3 5.58172 7.47715 2 13 2C18.5228 2 22 5.58172 22 10Z" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
                  <circle cx="8" cy="10" r="1.5" fill="#4A4A4A" />
                  <circle cx="12" cy="10" r="1.5" fill="#4A4A4A" />
                  <circle cx="16" cy="10" r="1.5" fill="#4A4A4A" />
                </svg>
              </div>
            </Link>
            {user ? (
              <>
                <Link href="/cabinet" className="nav-link flex items-center gap-2">
                  Kabinet
                  <img src={UserIcon} alt="Kabinet" style={{ width: '20px', height: '20px' }} />
                </Link>
                <button onClick={handleLogout} className="nav-link">
                  Chiqish
                </button>
              </>
            ) : (
              <Link href="/signin" className="nav-link flex items-center gap-2">
                Kirish
                <img src={UserIcon} alt="Kirish" style={{ width: '20px', height: '20px' }} />
              </Link>
            )}
          </nav>
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <a href="#about" className="mobile-nav-link">Biz haqimizda</a>
            <a href="#kindergartens" className="mobile-nav-link">Bog'chalar</a>
            <Link href="/community" className="nav-pill mobile-nav-pill">
              7 mahalla
              <div className="nav-pill-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10C22 14.4183 17.5228 18 12 18C10.9704 18 9.98297 17.8529 9.05742 17.5806C8.63468 17.4563 8.18348 17.4436 7.75336 17.5442L4.54581 18.2941C3.97441 18.4277 3.47953 17.8863 3.66442 17.3323L4.52208 14.7621C4.66172 14.3437 4.65487 13.8893 4.5024 13.4764C3.54125 12.4411 3 11.2666 3 10C3 5.58172 7.47715 2 13 2C18.5228 2 22 5.58172 22 10Z" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
                  <circle cx="8" cy="10" r="1.5" fill="#4A4A4A" />
                  <circle cx="12" cy="10" r="1.5" fill="#4A4A4A" />
                  <circle cx="16" cy="10" r="1.5" fill="#4A4A4A" />
                </svg>
              </div>
            </Link>
            {user ? (
              <>
                <Link href="/cabinet" className="mobile-nav-link flex items-center gap-2">
                  <img src={UserIcon} alt="Kabinet" style={{ width: '20px', height: '20px' }} />
                  Kabinet
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link">
                  Chiqish
                </button>
              </>
            ) : (
              <Link href="/signin" className="mobile-nav-link flex items-center gap-2">
                <img src={UserIcon} alt="Kirish" style={{ width: '20px', height: '20px' }} />
                Kirish
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
