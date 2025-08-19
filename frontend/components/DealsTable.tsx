import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../lib/api'

// Types
interface Deal {
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
}

interface DealsResponse {
  deals: Deal[]
  total: number
  state: string | null
}

// API base URL
const API_BASE = getApiBaseUrl()

export default function DealsTable() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const res = await fetch(`${API_BASE}/api/deals?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data: DealsResponse = await res.json()
        setDeals(data.deals)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deals')
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ZIP</th>
          <th>City</th>
          <th>State</th>
          <th>Permits</th>
        </tr>
      </thead>
      <tbody>
        {deals.map((d) => (
          <tr key={d.zip_code}>
            <td>{d.zip_code}</td>
            <td>{d.city}</td>
            <td>{d.state}</td>
            <td>{d.permit_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
