'use client'

import { useState, useEffect } from 'react'
import { getIcon } from '@/lib/icon-map'
import Image from 'next/image'
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Trophy,
  Award,
  Target,
  HeartPulse,
  Brain,
  Shield,
  CheckCircle,
  Navigation,
  ChevronRight,
  Filter,
  AlertCircle,
  CircleDashed,
  Hand,
} from 'lucide-react'

interface DistrictEvent {
  id: number
  name: string
  date: string
  venue: string
  quota: string
  province: string
  mapLink: string
  duration: string
  groundType: string
  coordinates: { lat: number; lng: number }
  status: string
}

interface Category {
  id: string | number
  title: string
  icon: string
  tests: { name: string; description: string; points: string }[]
  total: number
}

interface CommonTest {
  id: number
  name: string
  description: string
  points_description: string
  icon_name: string | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return { badge: 'bg-green-500', text: 'text-green-400' }
    case 'LIVE NOW': return { badge: 'bg-orange-500', text: 'text-orange-400' }
    case 'UPCOMING': return { badge: 'bg-blue-500', text: 'text-blue-400' }
    case 'SCHEDULED': return { badge: 'bg-purple-500', text: 'text-purple-400' }
    default: return { badge: 'bg-gray-500', text: 'text-gray-400' }
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Date not specified'
  }
}

const formatTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return 'Time not specified'
  }
}


export default function SelectionsPortal() {
  const [currentGender, setCurrentGender] = useState<'boys' | 'girls'>('boys')
  const [districtData, setDistrictData] = useState<DistrictEvent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [commonTests, setCommonTests] = useState<CommonTest[]>([])
  const [provinces, setProvinces] = useState<string[]>(['All'])
  const [selectedProvince, setSelectedProvince] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Categories API: ${res.status} ${err}`)
        }
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError(prev => prev ? prev + '; Categories failed' : 'Categories failed')
      }
    }

    const fetchCommonTests = async () => {
      try {
        const res = await fetch('/api/common-tests')
        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Common tests API: ${res.status} ${err}`)
        }
        const data = await res.json()
        setCommonTests(data)
      } catch (err) {
        console.error('Failed to fetch common tests:', err)
        setError(prev => prev ? prev + '; Common tests failed' : 'Common tests failed')
      }
    }

    fetchCategories()
    fetchCommonTests()
  }, [])


  useEffect(() => {
    const fetchDistricts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          gender: currentGender,
          ...(selectedProvince !== 'All' && { province: selectedProvince }),
          ...(searchQuery && { search: searchQuery }),
        })
        const res = await fetch(`/api/districts?${params}`)
        if (!res.ok) throw new Error('Failed to load districts')
        const data = await res.json()
        setDistrictData(data)

        const uniqueProvinces = ['All', ...Array.from(new Set(data.map((d: DistrictEvent) => d.province)))]
        setProvinces(uniqueProvinces)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchDistricts()
  }, [currentGender, selectedProvince, searchQuery])

  const handleGenderChange = (gender: 'boys' | 'girls') => {
    setCurrentGender(gender)
    setSelectedProvince('All')
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">

      <div className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-1000/10 to-black/90"></div>
        <div className="max-w-6xl mx-auto px-4 py-28 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="rounded-full border-0 border-yellow-1200 overflow-hidden w-36 h-36 flex items-center justify-center bg-black">
              <Image
                src="/image55.png"
                alt="Sri Lanka Cricket Talent Selection"
                width={150}
                height={150}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-yellow-400">PATH OF THE CRICKET</span>
          </h1>

          <div className="mb-8">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-700/30 to-amber-800/30 rounded-full border border-yellow-600/50">
              <h2 className="text-2xl font-bold text-yellow-300">ANNUAL TALENT SELECTION PORTAL</h2>
            </div>
          </div>

          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            Track the <span className="text-yellow-400 font-bold">District Selection</span> process (Top 30 per district).
            Selections are filtered via a performance-based algorithm.
          </p>
        </div>
      </div>

    
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-6 text-white">SELECT PLAYER CATEGORY</h3>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button
              onClick={() => handleGenderChange('boys')}
              className={`flex-1 max-w-md p-6 rounded-xl transition-all transform ${
                currentGender === 'boys'
                  ? 'bg-gradient-to-r from-blue-900/60 to-blue-800/60 border-2 border-blue-500 scale-105'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-blue-500'
              }`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`p-3 rounded-full ${currentGender === 'boys' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                  <Trophy className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <h4 className="text-2xl font-bold">BOYS SELECTION</h4>
                  <p className="text-gray-300">25 Districts • Top 30 Players Each</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleGenderChange('girls')}
              className={`flex-1 max-w-md p-6 rounded-xl transition-all transform ${
                currentGender === 'girls'
                  ? 'bg-gradient-to-r from-pink-900/60 to-purple-800/60 border-2 border-pink-500 scale-105'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-pink-500'
              }`}
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`p-3 rounded-full ${currentGender === 'girls' ? 'bg-pink-500' : 'bg-gray-700'}`}>
                  <Award className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <h4 className="text-2xl font-bold">GIRLS SELECTION</h4>
                  <p className="text-gray-300">25 Districts • Top 30 Players Each</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
            Warning: {error} – using fallback data if available.
          </div>
        </div>
      )}

    
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-yellow-400">SELECTION CATEGORIES & SCORING</h3>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500 transition-all group flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-yellow-500/20 rounded-full blur-md group-hover:blur-lg transition"></div>
                    <div className="relative p-3 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-xl">
                      {getIcon(category.icon, 'h-8 w-8')}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold">{category.title}</h4>
                </div>

                <div className="space-y-4 flex-1">
           
                  {(category.tests || []).map((test, idx) => (
                    <div key={idx} className="border-b border-gray-700 pb-3 last:border-0">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-yellow-300">{test.name}</p>
                          <p className="text-sm text-gray-400">{test.description}</p>
                          <p className="text-xs text-yellow-500">{test.points}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!category.tests || category.tests.length === 0) && (
                    <p className="text-gray-500 text-sm">No tests defined</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300">
                    <span className="font-bold text-yellow-400">Role total: {category.total} points</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className="mt-10 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700">
          <h4 className="text-xl font-bold text-yellow-400 mb-4">⚡ COMMON TESTS FOR ALL CATEGORIES</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {commonTests.length > 0 ? (
              commonTests.map((test) => (
                <div key={test.id} className="flex items-start gap-3 bg-gray-800/30 p-3 rounded-lg">
                  {test.icon_name && getIcon(test.icon_name, 'h-5 w-5 text-yellow-400')}
                  <div>
                    <p className="font-semibold">{test.name}</p>
                    <p className="text-sm text-gray-400">{test.description}</p>
                    <p className="text-xs text-yellow-500">{test.points_description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400">Loading common tests...</div>
            )}
          </div>
          <div className="text-center bg-gray-800/50 p-4 rounded-xl">
            <p className="text-lg">
              <span className="font-bold text-yellow-400">TOTAL MAXIMUM SCORE: 100 POINTS</span>
              <br />
              <span className="text-gray-300">(Role‑specific 60 + Common 40)</span>
            </p>
            <p className="mt-2 text-xl">
              <span className="font-bold text-green-400">SELECTION THRESHOLD: 70% (70 POINTS)</span>
              <br />
              <span className="text-sm text-gray-400">Applies to both Boys and Girls categories</span>
            </p>
          </div>
        </div>
      </div>

  
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 border border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h3 className="text-3xl font-bold text-yellow-400">SRI LANKA DISTRICT SELECTION SCHEDULES</h3>
              <p className="text-gray-400">
                Top 30 players will be selected from each district (10 Batters / 10 All-Rounders / 10 Bowlers)
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-yellow-500"
                >
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province === 'All' ? 'All Provinces' : `${province} Province`}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Search district or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-yellow-500 min-w-[250px]"
              />
            </div>
          </div>

      
          {loading ? (
            <div className="text-center py-12">Loading districts...</div>
          ) : error && districtData.length === 0 ? (
            <div className="text-center py-12 text-red-400">Error: {error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {districtData.map((district) => {
                const statusColor = getStatusColor(district.status)
                return (
                  <div
                    key={district.id}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-2xl p-6 hover:border-yellow-500 transition-all group hover:shadow-2xl hover:shadow-yellow-900/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold">{district.name}</h4>
                        <p className="text-gray-400 text-sm">{district.province} Province</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor.badge}`}>
                        {district.status}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Date</p>
                          <p className="font-semibold">{formatDate(district.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Time & Duration</p>
                          <p className="font-semibold">
                            {formatTime(district.date)} • {district.duration}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Venue</p>
                          <p className="font-semibold">{district.venue}</p>
                          <p className="text-xs text-gray-500">{district.groundType}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-sm text-gray-400">Selection Quota</p>
                          <p className="font-semibold">{district.quota}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={district.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg py-2 transition"
                      >
                        <Navigation className="h-4 w-4" />
                        View Map
                      </a>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-700 hover:to-amber-800 rounded-lg py-2 font-bold transition">
                        Apply Now
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && districtData.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-400 mb-2">No districts found</h4>
              <p className="text-gray-500">Try changing your search or filter criteria</p>
            </div>
          )}

       
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">25</div>
                  <div className="text-gray-300">Total Districts</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">750</div>
                  <div className="text-gray-300">Total Players Selected</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/30 to-amber-800/30 border border-yellow-700/50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">30</div>
                  <div className="text-gray-300">Players per District</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700/50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">4</div>
                  <div className="text-gray-300">Player Categories</div>
                </div>
              </div>
            </div>

            
            <div className="mt-8">
              <h4 className="text-xl font-bold text-yellow-400 mb-4">DISTRICTS BY PROVINCE</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from(new Set(districtData.map((d) => d.province))).map((province) => {
                  const provinceDistricts = districtData.filter((d) => d.province === province)
                  return (
                    <div key={province} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{provinceDistricts.length}</div>
                        <div className="text-gray-300 text-sm">{province}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          {provinceDistricts.map((d) => d.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}