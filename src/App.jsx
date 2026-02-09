import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import TopBogchalar from './components/TopBogchalar'
import WhyChooseUs from './components/WhyChooseUs'
import Community from './components/Community'
import Footer from './components/Footer'
import SearchResults from './components/SearchResults'
import KindergartenDetail from './components/KindergartenDetail'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import Cabinet from './components/Cabinet'

import Partners from './components/Partners'

// Home page component
function HomePage() {
  return (
    <div className="min-h-screen bg-[#200D37]">
      <Header />
      <Hero />
      <TopBogchalar />
      <Partners />
      <Community />
      <WhyChooseUs />
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
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/cabinet" element={<Cabinet />} />
    </Routes>
  )
}

export default App
