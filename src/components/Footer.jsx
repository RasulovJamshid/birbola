import React from 'react'
import { FaTelegramPlane, FaInstagram, FaFacebookF } from 'react-icons/fa'
import { IoMailOutline } from 'react-icons/io5'
import { FiArrowUp } from 'react-icons/fi'

const Logo = '/assets/birbola.svg'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-col">
          <a href="/" className="footer-logo">
            <img src={Logo} alt="Birbola" />
          </a>
          <p className="footer-desc">
            O'zbekistondagi eng yaxshi bog'chalarni topish va farzandingiz kelajagini birgalikda qurish uchun innovatsion platforma.
          </p>
          <div className="footer-socials">
            <a href="https://t.me/birbola" className="social-link" aria-label="Telegram">
              <FaTelegramPlane size={20} />
            </a>
            <a href="https://instagram.com/birbola" className="social-link" aria-label="Instagram">
              <FaInstagram size={20} />
            </a>
            <a href="https://facebook.com/birbola" className="social-link" aria-label="Facebook">
              <FaFacebookF size={18} />
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="footer-col">
          <h4>Kompaniya</h4>
          <ul className="footer-links">
            <li><a href="#about">Biz haqimizda</a></li>
            <li><a href="#careers">Vakansiyalar</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#press">Matbuot uchun</a></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="footer-col">
          <h4>Xizmatlar</h4>
          <ul className="footer-links">
            <li><a href="#kindergartens">Bog'chalar</a></li>
            <li><a href="#mahalla">7 mahalla</a></li>
            <li><a href="#cabinet">Shaxsiy kabinet</a></li>
            <li><a href="#map">Xarita orqali qidiruv</a></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="footer-col">
          <h4>Bog'lanish</h4>
          <ul className="footer-links">
            <li><a href="#faq">Ko'p so'raladigan savollar</a></li>
            <li><a href="#terms">Foydalanish shartlari</a></li>
            <li><a href="#privacy">Maxfiylik siyosati</a></li>
            <li className="mt-6">
              <a 
                href="mailto:birbola@mail.ru" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-blue-400 hover:bg-white/10 hover:border-white/20 transition-all w-fit"
              >
                <IoMailOutline size={20} />
                <span>birbola@mail.ru</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Birbola. Barcha huquqlar himoyalangan.</p>
        
        <button 
          onClick={scrollToTop}
          className="flex items-center gap-2 hover:text-white transition-colors group"
        >
          <span>Yuqoriga qaytish</span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-all">
            <FiArrowUp size={16} />
          </div>
        </button>
      </div>
    </footer>
  )
}

export default Footer