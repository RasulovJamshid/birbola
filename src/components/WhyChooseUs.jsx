import chatIcon from '../assets/chooseus/chat.svg'
import infosIcon from '../assets/chooseus/infos.svg'
import parentsIcon from '../assets/chooseus/parents.svg'
import handsIcon from '../assets/chooseus/hands.svg'
import logoIcon from '../assets/chooseus/logo.svg'

const features = [
  {
    id: 1,
    title: "Batafsil sharhlar",
    icon: chatIcon
  },
  {
    id: 2,
    title: "Keng qamrovli ma'lumotlar",
    icon: infosIcon
  },
  {
    id: 3,
    title: "Ota-onalar jamoasi",
    icon: parentsIcon
  },
  {
    id: 4,
    title: "Ishonchli hamkorlar",
    icon: handsIcon
  }
]

const WhyCard = ({ title, icon }) => {
  return (
    <div className="why-card">
      <div className="why-card-text">
        <h3>{title}</h3>
      </div>
      <img src={icon} alt={title} className="why-card-icon" />
    </div>
  )
}

// Center badge with icon grid
const CenterBadge = () => {
  return (
    <div className="why-center-orb">
      <img src={logoIcon} alt="Birbola" className="why-orb-icon" />
    </div>
  )
}

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2>Nega ota-onalar "birbola" ni tanlaydi?</h2>
        
        <div className="why-grid">
          {features.map((feature) => (
            <WhyCard
              key={feature.id}
              title={feature.title}
              icon={feature.icon}
            />
          ))}
          
          {/* Center Badge */}
          <CenterBadge />
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
