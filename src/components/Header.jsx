'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User } from 'lucide-react'
import { getCurrentUser } from '../services/api'

const Logo = '/assets/birbola.svg'

  const Header = ({ className = '', enableSticky = false, hideOnScroll = false, isTransparentInitially = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isSticky, setIsSticky] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Calculate scroll progress
      const winHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const totalDocScrollLength = docHeight - winHeight
      const scrollPostion = totalDocScrollLength > 0 
        ? Math.floor((currentScrollY / totalDocScrollLength) * 100)
        : 0
      setScrollProgress(scrollPostion)

      if (enableSticky) {
        setIsSticky(currentScrollY > 50) // More scroll before sticky kicks in
      }

      if (hideOnScroll) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
      }
      setLastScrollY(currentScrollY)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enableSticky, hideOnScroll, lastScrollY])

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('accessToken')
      if (!token) { setUser(null); return }
      getCurrentUser(token).then(setUser).catch(() => setUser(null))
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

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return
    const handler = (e) => {
      if (!e.target.closest('.header')) setIsMenuOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [isMenuOpen])

  return (
    <>
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>
      <header 
        className={`header ${className} ${isSticky ? 'is-sticky' : ''} ${hideOnScroll && !isVisible ? 'is-hidden' : ''} ${isTransparentInitially && !isSticky ? 'is-transparent' : ''}`}
      >
        <div className="header-inner">
        {/* Logo */}
        <div className="header-left">
          <Link href="/" className="logo">
            <Image src={Logo} alt="Birbola" width={120} height={40} priority />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          <Link href="/about" className="nav-link">
            Biz haqimizda
          </Link>
          <Link href="/search" className="nav-link">
            Bog&apos;chalar
          </Link>
          <Link href="/community" className="nav-link">
            7 mahalla
            <span className="nav-mahalla-badge">New</span>
          </Link>
        </nav>

        {/* Right side */}
        <div className="header-right">
          {user ? (
            <>
              <Link href="/cabinet" className="nav-auth-btn flex items-center gap-2">
                <User size={16} />
                Kabinet
              </Link>
              <button onClick={handleLogout} className="nav-link">
                Chiqish
              </button>
            </>
          ) : (
            <Link href="/signin" className="nav-auth-btn flex items-center gap-2">
              <User size={16} />
              Kirish
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`}>
        <nav className="mobile-nav">
          <Link href="/about" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Biz haqimizda
          </Link>
          <Link href="/search" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            Bog&apos;chalar
          </Link>
          <Link href="/community" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
            7 mahalla
          </Link>
          {user ? (
            <>
              <Link href="/cabinet" className="mobile-nav-link flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <User size={18} />
                Kabinet
              </Link>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false) }} className="mobile-nav-link text-left">
                Chiqish
              </button>
            </>
          ) : (
            <Link href="/signin" className="mobile-nav-auth-btn text-center block" onClick={() => setIsMenuOpen(false)}>
              Kirish
            </Link>
          )}
        </nav>
      </div>
    </header>
  </>
  )
}

export default Header
