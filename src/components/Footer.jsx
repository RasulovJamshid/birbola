import Logo from '../assets/birbola.svg'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Left Column */}
        <div className="footer-col footer-left">
          <a href="/" className="footer-logo">
            <img src={Logo} alt="Birbola" />
          </a>
          <ul className="footer-links">
            <li><a href="#about">Biz haqimizda</a></li>
            <li><a href="#kindergartens">Bog'chalar</a></li>
            <li><a href="#mahalla">7 mahalla</a></li>
            <li><a href="#cabinet">Kabinet</a></li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="footer-col footer-right">
          <h4>Biz bilan aloqa</h4>
          <ul className="footer-links">
            <li><a href="https://t.me/birbola">Telegram</a></li>
            <li><a href="https://instagram.com/birbola">Instagram</a></li>
            <li><a href="https://facebook.com/birbola">Facebook</a></li>
            <li>
              <span>Pochta: </span>
              <a href="mailto:birbola@mail.ru" className="footer-email">birbola@mail.ru</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
