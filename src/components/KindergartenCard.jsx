'use client'

import { useState } from 'react'
import { Star, MapPin, Heart, ShieldCheck, Coffee, Waves, Image as ImageIcon } from 'lucide-react'
import { Features } from '../services/api'

const KindergartenCard = ({ kg, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const isPremium = kg.score >= 4.8 || kg.isPremium; // Assuming some logic for premium
  
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'}`}
      />
    ))
  }

  // Feature icon mapping for quick scanning
  const getFeatureIcon = (featureId) => {
    switch (featureId) {
      case Features.POOL: return <Waves className="w-4 h-4" />;
      case Features.MEDICAL: return <ShieldCheck className="w-4 h-4" />;
      case Features.LUNCH: 
      case Features.BREAKFAST:
      case Features.DINNER:
      case Features.FULL: return <Coffee className="w-4 h-4" />;
      default: return null;
    }
  }

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative p-3">
        <div className="h-48 relative rounded-3xl overflow-hidden bg-gray-100 flex items-center justify-center">
          {kg.profilePhoto && !imgError ? (
            <img 
              src={kg.profilePhoto} 
              alt={kg.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a4e] to-[#2a2a6e] flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-white/10 mb-2" />
              <span className="text-white/20 text-xl font-bold">Birbola</span>
            </div>
          )}
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPremium && (
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                PREMIUM
              </span>
            )}
            {kg.meals && (
              <span className="bg-white/90 text-gray-800 text-[10px] font-medium px-2 py-1 rounded-full shadow-sm backdrop-blur-sm flex items-center gap-1">
                <Coffee size={10} className="text-orange-500" /> Ovqatli
              </span>
            )}
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); /* Add to favorites logic */ }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center transition-colors group/fav"
          >
            <Heart className="w-4 h-4 text-white group-hover/fav:text-red-500 group-hover/fav:fill-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-2 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#d946ef] transition-colors">
            {kg.name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-lg">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-yellow-700">{kg.score?.toFixed(1) || '5.0'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 mb-3">
          <MapPin size={14} className="flex-shrink-0" />
          <p className="text-xs line-clamp-1">
            {kg.district?.districtName || kg.districtName || 'Toshkent shaxri'}
          </p>
        </div>

        {/* Facility Quick Look */}
        <div className="flex gap-2 mb-4 mt-auto">
          {kg.features?.slice(0, 3).map((fId) => (
            <div key={fId} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#d946ef]/10 hover:text-[#d946ef] transition-colors border border-gray-100">
              {getFeatureIcon(fId) || <ShieldCheck size={14} />}
            </div>
          ))}
          {kg.features?.length > 3 && (
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
              +{kg.features.length - 3}
            </div>
          )}
        </div>

        {/* Pricing/Footer */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Oylik to'lov</p>
            <p className="text-sm font-extrabold text-gray-900">
              {kg.price ? `${kg.price.toLocaleString()} UZS` : 'Kelishilgan'}
            </p>
          </div>
          <button className="bg-[#1a1a4e] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#2a2a6e] transition-all">
            Batafsil
          </button>
        </div>
      </div>
    </div>
  )
}

export default KindergartenCard