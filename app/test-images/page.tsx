'use client'

// Test page to verify images are loading
export default function TestImagesPage() {
  const images = [
    '/assets/birbola.svg',
    '/assets/rocket.svg',
    '/assets/banner/family-center.png',
    '/assets/banner/account-user.svg',
    '/assets/top/noise.png',
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-white text-3xl mb-8">Image Loading Test</h1>
      <div className="grid grid-cols-2 gap-4">
        {images.map((src, index) => (
          <div key={index} className="bg-white p-4 rounded">
            <p className="text-sm mb-2 text-gray-700">{src}</p>
            <img 
              src={src} 
              alt={`Test ${index}`}
              className="max-w-full h-auto"
              onError={(e) => {
                console.error(`Failed to load: ${src}`)
                e.currentTarget.style.border = '2px solid red'
              }}
              onLoad={() => console.log(`Loaded: ${src}`)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
