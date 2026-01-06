import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import TopBogchalar from './components/TopBogchalar'
import WhyChooseUs from './components/WhyChooseUs'
import Community from './components/Community'
import Footer from './components/Footer'
import SearchResults from './components/SearchResults'
import KindergartenDetail from './components/KindergartenDetail'

// Home page component
function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#1a1a2e]">
      <Header />
      <Hero />
      <TopBogchalar />
      <WhyChooseUs />
      <Community />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/kindergarten/:id" element={<KindergartenDetail />} />
    </Routes>
  )
}

export default App
