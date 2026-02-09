'use client'

import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix marker icon issue in Next.js/Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/markers/marker-icon-2x.png',
    iconUrl: '/markers/marker-icon.png',
    shadowUrl: '/markers/marker-shadow.png',
})

// Custom pin icon with pulse
const customIcon = new L.DivIcon({
    className: 'custom-pin',
    html: `
    <div class="relative w-8 h-8 -ml-4 -mt-8 flex items-center justify-center">
      <div class="w-full h-full bg-[#d946ef] rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
      </div>
      <div class="absolute bottom-0 left-1/2 -ml-1 w-2 h-2 bg-[#d946ef] rotate-45 transform translate-y-1"></div>
      <div class="absolute -inset-4 bg-[#d946ef] rounded-full opacity-20 animate-ping"></div>
    </div>
  `
})

function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const KindergartenMap = ({ lat, lng, name, address }) => {
    const [active, setActive] = useState(false)

    // Default to Tashkent if no coords
    const position = [lat || 41.2995, lng || 69.2401]

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
                className="z-0"
                whenCreated={(map) => {
                    map.invalidateSize();
                }}
            >
                <ChangeView center={position} zoom={15} />

                {/* Dark Mode Tiles (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={position} icon={customIcon}>
                    <Popup className="custom-popup">
                        <div className="font-sans text-sm p-1">
                            <h3 className="font-bold text-[#d946ef] mb-1">{name}</h3>
                            <p className="text-gray-600 m-0">{address}</p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-2 text-xs text-blue-500 font-bold hover:underline"
                            >
                                Google Maps da ochish
                            </a>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Overlay controls if needed */}
            <div className="absolute top-4 right-4 z-[1000]">
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                    Google Maps
                </a>
            </div>
        </div>
    )
}

export default KindergartenMap
