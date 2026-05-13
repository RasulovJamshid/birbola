'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User } from 'lucide-react'
import { getCurrentUser } from '../services/api'

const Logo = '/assets/birbola.svg'

  const Header = ({
    className = '',
    enableSticky = false,
    hideOnScroll = false,
    isTransparentInitially = true,
    /** Shorter bar, hides center nav — use on /search for more viewport for content */
    compact = false,
    /** When hideOnScroll, notifies parent so toolbars can align (e.g. kindergarten subnav) */
    onScrollHideChange = undefined,
  }) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isSticky, setIsSticky] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollYRef = useRef(0)

  useEffect(() => {
    scrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0

    const handleScroll = () => {
      const y = window.scrollY

      const winHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const totalDocScrollLength = docHeight - winHeight
      const scrollPostion =
        totalDocScrollLength > 0 ? Math.floor((y / totalDocScrollLength) * 100) : 0
      setScrollProgress(scrollPostion)

      if (enableSticky) {
        setIsSticky(y > 50)
      }

      if (hideOnScroll) {
        const prev = scrollYRef.current
        const delta = y - prev
        if (y < 20) {
          setIsVisible(true)
        } else if (delta > 2 && y > 40) {
          setIsVisible(false)
          setIsMenuOpen(false)
        } else if (delta < -2) {
          setIsVisible(true)
        }
      }

      scrollYRef.current = y
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enableSticky, hideOnScroll])

  useEffect(() => {
    if (!hideOnScroll || typeof onScrollHideChange !== 'function') return
    onScrollHideChange(isVisible)
  }, [hideOnScroll, isVisible, onScrollHideChange])

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
      <div
        className={`scroll-progress-container${hideOnScroll && !isVisible ? ' scroll-progress-container--header-hidden' : ''}`}
        aria-hidden={hideOnScroll && !isVisible}
      >
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>
      <header
        className={`header ${compact ? 'header--compact' : ''} ${className} ${isSticky ? 'is-sticky' : ''} ${hideOnScroll && !isVisible ? 'is-hidden' : ''} ${isTransparentInitially && !isSticky && !compact ? 'is-transparent' : ''}`}
      >
        <div className="header-inner">
        {/* Logo */}
        <div className="header-left">
          <Link href="/" className="logo">
            <img
              src={Logo}
              alt="Birbola"
              width={133}
              height={30}
              decoding="async"
              fetchPriority="high"
              className="logo-img"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav" aria-label="Asosiy navigatsiya">
          <Link href="/about" className="nav-link" aria-current={pathname === '/about' ? 'page' : undefined}>
            Biz haqimizda
          </Link>
          <Link href="/search" className="nav-link" aria-current={pathname === '/search' ? 'page' : undefined}>
            Bog&apos;chalar
          </Link>
          <Link href="/community" className="nav-link" aria-current={pathname === '/community' ? 'page' : undefined}>
            7 mahalla
            <span className="nav-mahalla-badge">Yangi</span>
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
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div id="mobile-menu" className={`mobile-menu ${isMenuOpen ? 'is-open' : ''}`} aria-hidden={!isMenuOpen}>
        <nav className="mobile-nav" aria-label="Mobil navigatsiya">
          <Link href="/about" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} aria-current={pathname === '/about' ? 'page' : undefined}>
            Biz haqimizda
          </Link>
          <Link href="/search" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} aria-current={pathname === '/search' ? 'page' : undefined}>
            Bog&apos;chalar
          </Link>
          <Link href="/community" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)} aria-current={pathname === '/community' ? 'page' : undefined}>
            7 mahalla <span className="nav-mahalla-badge">Yangi</span>
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
