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
    // Default to Tashkent if no coords
    const position = [lat || 41.2995, lng || 69.2401]
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`

    return (
        <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="block w-full h-full relative z-0 group cursor-pointer"
        >
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                zoomControl={false}
                dragging={false}
                touchZoom={false}
                doubleClickZoom={false}
                boxZoom={false}
                keyboard={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0 pointer-events-none" // Disable pointer events on map to let click pass to anchor
                whenCreated={(map) => {
                    map.invalidateSize();
                }}
            >
                {/* Dark Mode Tiles (CartoDB Dark Matter) */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={position} icon={customIcon} />
            </MapContainer>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 font-bold shadow-2xl flex items-center gap-2">
                    <span>Google Maps da ochish</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </div>
            </div>

            {/* Corner Badge */}
            <div className="absolute top-4 right-4 z-10">
                <div className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1 group-hover:scale-105 transition-transform">
                    Google Maps
                </div>
            </div>
        </a>
    )
}

export default KindergartenMap
