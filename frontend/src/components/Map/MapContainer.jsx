import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, ExternalLink, Play } from 'lucide-react';

// Custom CSS for markers, popups, and route animation
const customMarkerStyle = `
  .custom-leaflet-marker {
    background: transparent !important;
    border: none !important;
  }
  .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.98) !important;
    backdrop-filter: blur(16px) !important;
    border: 1px solid #E2E8F0 !important;
    border-radius: 18px !important;
    box-shadow: 0 16px 30px -8px rgba(15, 23, 42, 0.15) !important;
    color: #0F172A !important;
    padding: 4px !important;
  }
  .leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.98) !important;
    border: 1px solid #E2E8F0 !important;
  }
  .leaflet-container {
    font-family: inherit !important;
    z-index: 10 !important;
  }
`;

const createIcon = (type, isSelected = false) => {
  const t = type?.toLowerCase() || '';
  let bgColor, iconSvg, borderColor;

  if (t.includes('police')) {
    bgColor = isSelected ? '#1E40AF' : '#2563EB';
    borderColor = '#1E3A8A';
    iconSvg = `<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
  } else if (t.includes('hospital') || t.includes('clinic') || t.includes('medical')) {
    bgColor = isSelected ? '#B91C1C' : '#DC2626';
    borderColor = '#991B1B';
    iconSvg = `<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v12M6 12h12"/><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>`;
  } else if (t.includes('sos') || t.includes('incident') || t.includes('alert')) {
    bgColor = '#DC2626';
    borderColor = '#991B1B';
    iconSvg = `<svg class="w-5 h-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  } else {
    // Safe Zone / Community Hub
    bgColor = isSelected ? '#1D4ED8' : '#3B82F6';
    borderColor = '#1E40AF';
    iconSvg = `<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  }

  const scale = isSelected ? 'scale(1.18)' : 'scale(1)';

  return new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="transform: ${scale}; transition: transform 0.2s ease;" class="relative flex items-center justify-center">
        <div style="background-color: ${bgColor}; border: 2px solid ${borderColor};" class="w-10 h-10 rounded-2xl shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          ${iconSvg}
        </div>
        <div style="background-color: ${borderColor};" class="absolute -bottom-1 w-2 h-2 rotate-45"></div>
      </div>
    `,
    iconSize: [40, 44],
    iconAnchor: [20, 42],
    popupAnchor: [0, -42]
  });
};

const userIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="relative flex items-center justify-center w-14 h-14">
      <div class="absolute w-14 h-14 bg-[#2563EB]/25 rounded-full animate-ping"></div>
      <div class="absolute w-9 h-9 bg-[#2563EB]/40 rounded-full animate-pulse"></div>
      <div class="w-7 h-7 rounded-full bg-white shadow-2xl flex items-center justify-center z-10 border-2 border-[#2563EB]">
        <div class="w-3.5 h-3.5 rounded-full bg-[#2563EB] shadow-[0_0_10px_rgba(37,99,235,0.7)]"></div>
      </div>
    </div>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
  popupAnchor: [0, -28]
});

// Live Navigation Arrow Marker (Google Maps Style)
const navUserIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="relative flex items-center justify-center w-16 h-16">
      <div class="absolute w-16 h-16 bg-[#16A34A]/30 rounded-full animate-ping"></div>
      <div class="w-11 h-11 rounded-full bg-[#16A34A] shadow-[0_0_24px_rgba(22,163,74,0.6)] flex items-center justify-center z-20 border-3 border-white ring-4 ring-[#16A34A]/40">
        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [64, 64],
  iconAnchor: [32, 32],
  popupAnchor: [0, -32]
});

// Target Destination Marker
const destFlagIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div class="relative flex items-center justify-center w-12 h-12">
      <div class="w-10 h-10 rounded-2xl bg-[#DC2626] border-2 border-white shadow-2xl flex items-center justify-center animate-bounce">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
          <line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 44],
  popupAnchor: [0, -44]
});

function MapViewController({ center, zoom, renderKey }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map, renderKey]);
  return null;
}

// Controller to auto-fit bounds to the driving route
function RouteBoundsController({ routeCoordinates, isNavigating, userLocation, selectedPoiId }) {
  const map = useMap();

  useEffect(() => {
    if (isNavigating && userLocation) {
      map.flyTo(userLocation, 17, { animate: true, duration: 1.0 });
    } else if (routeCoordinates && routeCoordinates.length > 1) {
      try {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds, { padding: [60, 60], animate: true, maxZoom: 16 });
      } catch (e) {}
    }
  }, [routeCoordinates, isNavigating, userLocation, selectedPoiId, map]);

  return null;
}

export default function CustomMapContainer({
  location,
  userLocation,
  mapCenter,
  pois = [],
  selectedPoiId = null,
  onSelectPoi = null,
  onStartNavigation = null,
  routeCoordinates = null,
  isNavigating = false,
  destinationPoi = null,
  zoom = 14,
  renderKey = 0
}) {
  const effectiveUserLoc = userLocation || location || [26.9425, 80.9269];
  const effectiveCenter = mapCenter || location || userLocation || [26.9425, 80.9269];

  const validCenter = Array.isArray(effectiveCenter) && effectiveCenter.length === 2 && !isNaN(effectiveCenter[0])
    ? effectiveCenter
    : [26.9425, 80.9269];

  const validUserLoc = Array.isArray(effectiveUserLoc) && effectiveUserLoc.length === 2 && !isNaN(effectiveUserLoc[0])
    ? effectiveUserLoc
    : validCenter;

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden rounded-[20px] bg-[#F8FAFC]">
      <style>{customMarkerStyle}</style>
      <LeafletMap
        center={validCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
        zoomControl={true}
      >
        <MapViewController center={validCenter} zoom={zoom} renderKey={renderKey} />
        
        {/* Route auto-fitting and navigation follow */}
        <RouteBoundsController
          routeCoordinates={routeCoordinates}
          isNavigating={isNavigating}
          userLocation={validUserLoc}
          selectedPoiId={selectedPoiId}
        />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Live Route Polyline (Outer Glow + Solid Inner Line) */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: isNavigating ? '#15803D' : '#1D4ED8',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: isNavigating ? '#22C55E' : '#2563EB',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: isNavigating ? '8, 8' : undefined
              }}
            />
          </>
        )}

        {/* User Current Live Location Marker */}
        <Marker position={validUserLoc} icon={isNavigating ? navUserIcon : userIcon}>
          <Popup className="text-[#0F172A]">
            <div className="p-2 text-center">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-1 border ${
                isNavigating ? 'bg-green-100 text-green-800 border-green-300' : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isNavigating ? 'bg-green-600' : 'bg-[#2563EB]'} animate-pulse`}></span>
                {isNavigating ? 'Navigating from here' : 'You are here'}
              </div>
              <p className="text-xs text-[#64748B] font-mono mt-1">
                {validUserLoc[0].toFixed(5)}, {validUserLoc[1].toFixed(5)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Target Flag Marker */}
        {destinationPoi && destinationPoi.lat && destinationPoi.lon && (
          <Marker position={[destinationPoi.lat, destinationPoi.lon]} icon={destFlagIcon}>
            <Popup>
              <div className="p-2 text-center">
                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                  Target Destination
                </span>
                <p className="font-bold text-sm text-[#0F172A] mt-1">{destinationPoi.name}</p>
                <p className="text-xs text-[#64748B]">{destinationPoi.address || destinationPoi.distance}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* POI Markers */}
        {pois.map((poi) => {
          const lat = poi.lat || poi.location?.coordinates?.[1];
          const lon = poi.lon || poi.lng || poi.location?.coordinates?.[0];
          if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;

          const isSelected = selectedPoiId === (poi.id || poi._id);
          const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${validUserLoc[0]},${validUserLoc[1]}&destination=${lat},${lon}&travelmode=driving`;

          return (
            <Marker
              key={poi.id || poi._id || `${lat}-${lon}`}
              position={[lat, lon]}
              icon={createIcon(poi.type, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectPoi) onSelectPoi(poi);
                }
              }}
            >
              <Popup>
                <div className="p-2.5 max-w-[240px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[10px] font-bold uppercase tracking-wider text-[#2563EB] border border-[#BFDBFE]">
                      {poi.type || 'Safe Place'}
                    </span>
                    {poi.rating && (
                      <span className="text-[#D97706] text-xs font-semibold flex items-center gap-1">
                        ★ {poi.rating}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-[#0F172A] text-sm leading-snug">{poi.name}</h4>
                  {poi.distance && (
                    <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1 font-medium">
                      📍 {poi.distance} away
                    </p>
                  )}
                  {poi.status && (
                    <p className="text-[11px] text-[#64748B] mt-0.5">{poi.status}</p>
                  )}
                  
                  {/* Action buttons in popup */}
                  <div className="mt-3 flex gap-1.5">
                    <button
                      onClick={() => {
                        if (onStartNavigation) onStartNavigation(poi);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold text-center transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-white" /> Start
                    </button>
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE] text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                      title="Open in Google Maps App"
                    >
                      Maps <ExternalLink className="h-3 w-3 text-[#2563EB]" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
}
