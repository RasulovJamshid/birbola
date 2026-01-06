import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from '../assets/birbola.svg'
import ChatIcon from '../assets/banner/over-button-chat.svg'
import UserIcon from '../assets/banner/account-user.svg'

const Header = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className={`header ${className}`}>
      <div className="header-inner">
        {/* Logo */}
        <div className="header-left">
          <a href="/" className="logo">
            <img src={Logo} alt="Birbola" />
          </a>
        </div>

        

        {/* Right side utilities */}
        <div className="header-right">
          {/* Desktop Navigation */}
          <nav className="header-nav">
            <a href="/#about" className="nav-link">Biz haqimizda</a>
            <a href="/#kindergartens" className="nav-link">Bog'chalar</a>
            <button className="nav-pill">
              7 mahalla
              <div className="nav-pill-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10C22 14.4183 17.5228 18 12 18C10.9704 18 9.98297 17.8529 9.05742 17.5806C8.63468 17.4563 8.18348 17.4436 7.75336 17.5442L4.54581 18.2941C3.97441 18.4277 3.47953 17.8863 3.66442 17.3323L4.52208 14.7621C4.66172 14.3437 4.65487 13.8893 4.5024 13.4764C3.54125 12.4411 3 11.2666 3 10C3 5.58172 7.47715 2 13 2C18.5228 2 22 5.58172 22 10Z" fill="white" stroke="#E5E7EB" strokeWidth="0.5"/>
                  <circle cx="8" cy="10" r="1.5" fill="#4A4A4A"/>
                  <circle cx="12" cy="10" r="1.5" fill="#4A4A4A"/>
                  <circle cx="16" cy="10" r="1.5" fill="#4A4A4A"/>
                </svg>
              </div>
            </button>
            <a href="#cabinet" className="nav-link flex items-center gap-2">
              Kabinet
              <img src={UserIcon} alt="Kabinet" style={{ width: '20px', height: '20px' }} />
            </a>
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
            <button className="nav-pill mobile-nav-pill">
              7 mahalla
              <div className="nav-pill-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10C22 14.4183 17.5228 18 12 18C10.9704 18 9.98297 17.8529 9.05742 17.5806C8.63468 17.4563 8.18348 17.4436 7.75336 17.5442L4.54581 18.2941C3.97441 18.4277 3.47953 17.8863 3.66442 17.3323L4.52208 14.7621C4.66172 14.3437 4.65487 13.8893 4.5024 13.4764C3.54125 12.4411 3 11.2666 3 10C3 5.58172 7.47715 2 13 2C18.5228 2 22 5.58172 22 10Z" fill="white" stroke="#E5E7EB" strokeWidth="0.5"/>
                  <circle cx="8" cy="10" r="1.5" fill="#4A4A4A"/>
                  <circle cx="12" cy="10" r="1.5" fill="#4A4A4A"/>
                  <circle cx="16" cy="10" r="1.5" fill="#4A4A4A"/>
                </svg>
              </div>
            </button>
            <a href="#cabinet" className="mobile-nav-link flex items-center gap-2">
              <img src={UserIcon} alt="Kabinet" style={{ width: '20px', height: '20px' }} />
              Kabinet
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
