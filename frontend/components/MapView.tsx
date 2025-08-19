import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DealMetrics {
  zip_code: string
  city: string
  state: string
  rent_index: number | null
  home_value_index: number | null
  permit_count: number
  income: number | null
  population: number | null
  rent_growth: number | null
  value_growth: number | null
  flood_flag: boolean | null
  news_count: number | null
}

interface MapViewProps {
  deals: DealMetrics[]
  mapLayer: 'permits' | 'rent_growth' | 'flood_risk'
  onZipSelect: (zip: string) => void
  selectedZip: string | null
}

// Mock ZIP code coordinates for NJ/PA (in production, you'd use real geocoding)
const ZIP_COORDINATES: { [key: string]: [number, number] } = {
  '07302': [40.7176, -74.0431], // Jersey City, NJ
  '08540': [40.3573, -74.6599], // Princeton, NJ
  '19102': [39.9526, -75.1652], // Philadelphia, PA
  '19147': [39.9326, -75.1576], // Philadelphia, PA
  '07030': [40.7445, -74.0324], // Hoboken, NJ
  '07087': [40.7795, -74.0237], // Union City, NJ
  '08002': [39.9339, -74.9724], // Cherry Hill, NJ
  '19020': [40.0190, -75.3166], // Bryn Mawr, PA
  '19087': [40.0440, -75.3877], // Wayne, PA
  '19406': [40.0890, -75.3830], // King of Prussia, PA
  '07102': [40.7357, -74.1724], // Newark, NJ
  '08102': [39.9459, -75.1196], // Camden, NJ
  '19112': [39.8890, -75.1780], // Philadelphia Navy Yard, PA
  '07114': [40.6895, -74.1745], // Newark Airport, NJ
  '08103': [39.9459, -75.1196], // Camden, NJ
}

const MapView: React.FC<MapViewProps> = ({ deals, mapLayer, onZipSelect, selectedZip }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.CircleMarker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([40.0583, -74.4057], 8) // Center on NJ/PA area

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for each deal
    deals.forEach(deal => {
      const coordinates = ZIP_COORDINATES[deal.zip_code]
      if (!coordinates) return

      const [lat, lng] = coordinates

      // Determine marker color and size based on map layer
      let color = '#3B82F6' // Default blue
      let radius = 8

      if (mapLayer === 'permits') {
        if (deal.permit_count >= 20) {
          color = '#EF4444' // Red for high
          radius = 12
        } else if (deal.permit_count >= 5) {
          color = '#F59E0B' // Yellow for medium
          radius = 10
        } else {
          color = '#10B981' // Green for low
          radius = 8
        }
      } else if (mapLayer === 'rent_growth') {
        if (deal.rent_growth && deal.rent_growth > 5) {
          color = '#EF4444' // Red for high growth
          radius = 12
        } else if (deal.rent_growth && deal.rent_growth > 0) {
          color = '#F59E0B' // Yellow for positive growth
          radius = 10
        } else {
          color = '#10B981' // Green for low/negative
          radius = 8
        }
      } else if (mapLayer === 'flood_risk') {
        if (deal.flood_flag) {
          color = '#DC2626' // Red for high risk
          radius = 12
        } else {
          color = '#059669' // Green for low risk
          radius = 8
        }
      }

      // Create circle marker
      const marker = L.circleMarker([lat, lng], {
        radius,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapInstanceRef.current!)

      // Add popup with basic info
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-lg">${deal.city}, ${deal.state}</h3>
          <p class="text-sm text-gray-600">${deal.zip_code}</p>
          <div class="mt-2 space-y-1 text-sm">
            <div>Permits: ${deal.permit_count}</div>
            <div>Rent: ${deal.rent_index ? `$${deal.rent_index.toLocaleString()}` : 'N/A'}</div>
            <div>Growth: ${deal.rent_growth ? `${deal.rent_growth > 0 ? '+' : ''}${deal.rent_growth.toFixed(1)}%` : 'N/A'}</div>
            <div>Flood Risk: ${deal.flood_flag ? '⚠️ HIGH' : '✅ LOW'}</div>
          </div>
        </div>
      `
      marker.bindPopup(popupContent)

      // Add click handler
      marker.on('click', () => {
        onZipSelect(deal.zip_code)
      })

      // Highlight selected ZIP
      if (selectedZip === deal.zip_code) {
        marker.setStyle({
          color: '#000000',
          weight: 4,
          fillOpacity: 1
        })
      }

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [deals, mapLayer, selectedZip, onZipSelect])

  return (
    <div className="w-full h-96 md:h-[600px]">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}

export default MapView
