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
    <footer className="bg-[#0d061f] text-white relative overflow-hidden border-t border-white/5">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column - Takes more space */}
          <div className="lg:col-span-4 flex flex-col">
            <a href="/" className="inline-block mb-5">
              <img src={Logo} alt="Birbola" className="h-8 w-auto" />
            </a>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              O'zbekistondagi eng yaxshi bog'chalarni topish va farzandingiz kelajagini birgalikda qurish uchun innovatsion platforma.
            </p>
            <div className="flex gap-3 mt-auto">
              <a 
                href="https://t.me/birbola" 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:scale-110" 
                aria-label="Telegram"
              >
                <FaTelegramPlane size={18} />
              </a>
              <a 
                href="https://instagram.com/birbola" 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:scale-110" 
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a 
                href="https://facebook.com/birbola" 
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all hover:scale-110" 
                aria-label="Facebook"
              >
                <FaFacebookF size={16} />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold mb-6 text-white/90 uppercase tracking-wider text-sm">Kompaniya</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Biz haqimizda
                </a>
              </li>
              <li>
                <a href="#careers" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Vakansiyalar
                </a>
              </li>
              <li>
                <a href="#blog" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Blog
                </a>
              </li>
              <li>
                <a href="#press" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Matbuot uchun
                </a>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold mb-6 text-white/90 uppercase tracking-wider text-sm">Xizmatlar</h4>
            <ul className="space-y-3">
              <li>
                <a href="#kindergartens" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Bog'chalar
                </a>
              </li>
              <li>
                <a href="#mahalla" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  7 mahalla
                </a>
              </li>
              <li>
                <a href="#cabinet" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Shaxsiy kabinet
                </a>
              </li>
              <li>
                <a href="#map" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Xarita orqali qidiruv
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-4">
            <h4 className="text-base font-bold mb-6 text-white/90 uppercase tracking-wider text-sm">Bog'lanish</h4>
            <ul className="space-y-3">
              <li>
                <a href="#faq" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Ko'p so'raladigan savollar
                </a>
              </li>
              <li>
                <a href="#terms" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Foydalanish shartlari
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-sm text-white/60 hover:text-white hover:translate-x-1 inline-block transition-all">
                  Maxfiylik siyosati
                </a>
              </li>
            </ul>
            <a 
              href="mailto:birbola@mail.ru" 
              className="mt-6 inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-blue-400 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <IoMailOutline size={20} className="group-hover:scale-110 transition-transform" />
              <span>birbola@mail.ru</span>
            </a>
          </div>
        </div>

        {/* Footer Bottom - Centered */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50 text-center sm:text-left">
            © {new Date().getFullYear()} Birbola. Barcha huquqlar himoyalangan.
          </p>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all group"
          >
            <span className="font-medium">Yuqoriga qaytish</span>
            <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 group-hover:-translate-y-1 transition-all">
              <FiArrowUp size={16} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer