'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'  
import { RealtimeChannel } from '@supabase/supabase-js'

const PROVINCES = [
  'Western', 'Southern', 'Central', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
] as const

const TOP_PLAYERS_COUNT = 10

type Gender = 'male' | 'female'
type Category = 'batting' | 'bowling' | 'allrounder'
type Province = typeof PROVINCES[number]

interface Player {
  id: string
  full_name: string
  province: Province
  gender: Gender
  runs: number
  wickets: number
  fifties: number
  catches: number
  matches_played?: number
  highest_score?: number
  best_bowling?: string
  created_at?: string
  batting_points: number
  bowling_points: number
  allrounder_points: number
}

interface Stats {
  points: number
  average: string
  detail: string
}

interface PlayerWithStats extends Player {
  stats: Stats
}

export default function RankingPage() {
  const [currentGender, setCurrentGender] = useState<Gender>('male')
  const [currentCategory, setCurrentCategory] = useState<Category>('batting')
  const [currentProvinceFilter, setCurrentProvinceFilter] = useState<string>('All')
  const [currentSearchTerm, setCurrentSearchTerm] = useState('')
  const [playersData, setPlayersData] = useState<Record<Gender, Player[]>>({ 
    male: [], 
    female: [] 
  })
  const [isRemainingOpen, setIsRemainingOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  const mountedRef = useRef(true)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const latestRequestIdRef = useRef(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

 
  const fetchPlayers = useCallback(async (gender: Gender): Promise<Player[]> => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('gender', gender)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err: any) {
      
      if (err.name === 'AbortError' || err.message?.includes('AbortError')) {
        console.log('Fetch aborted, ignoring')
        return []
      }
      console.error(`Error fetching ${gender} players:`, err.message)
      if (mountedRef.current) {
        setError(`Failed to load ${gender} players. ${err.message}`)
      }
      return []
    }
  }, [])

 
  const loadAllPlayers = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current
    if (!mountedRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const [male, female] = await Promise.all([
        fetchPlayers('male'),
        fetchPlayers('female')
      ])

      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        setPlayersData({ male, female })
      } else {
        console.log(`Ignoring stale player data (requestId ${requestId})`)
      }
    } catch (err: any) {
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        setError('Failed to load player data.')
      }
    } finally {
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [fetchPlayers])

  // Initial load
  useEffect(() => {
    mountedRef.current = true
    loadAllPlayers()

    return () => {
      mountedRef.current = false
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    }
  }, [loadAllPlayers])

  
  useEffect(() => {
    
    const channelName = `players-changes-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        async (payload) => {
          console.log('Real-time change received:', payload)
         
          if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
          refreshTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              loadAllPlayers()
            }
          }, 500)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime subscription active:', channelName)
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel error, will retry on next change')
        }
      })

    channelRef.current = channel

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {})
        channelRef.current = null
      }
    }
  }, [loadAllPlayers])

 
  const getPlayerStats = useCallback((player: Player, category: Category): Stats => {
    const matches = player.matches_played || 4

    if (category === 'batting') {
      return {
        points: player.batting_points,
        average: (player.runs / matches).toFixed(2),
        detail: `Matches: ${matches}, Runs: ${player.runs}, 50s: ${player.fifties}, HS: ${player.highest_score || 'N/A'}`
      }
    } else if (category === 'bowling') {
      return {
        points: player.bowling_points,
        average: (player.wickets / matches).toFixed(2),
        detail: `Matches: ${matches}, Wickets: ${player.wickets}, Catches: ${player.catches}, Best: ${player.best_bowling || 'N/A'}`
      }
    } else {

      return {
        points: player.allrounder_points,
        average: ((player.runs + (player.wickets * 30)) / (matches * 2)).toFixed(2),
        detail: `Batting: ${player.runs} runs (${player.fifties} fifties) | Bowling: ${player.wickets} wickets | Fielding: ${player.catches} catches`
      }
    }
  }, [])


  const rankedPlayers = useMemo((): PlayerWithStats[] => {
    const currentPlayers = playersData[currentGender] || []
    if (!currentPlayers.length) return []

    let filtered = currentPlayers
    if (currentProvinceFilter !== 'All') {
      filtered = currentPlayers.filter(p => p.province === currentProvinceFilter)
    }

    if (currentSearchTerm) {
      const term = currentSearchTerm.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.full_name.toLowerCase().includes(term) ||
          p.province.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term)
      )
    }

    return filtered
      .map(p => ({ 
        ...p, 
        stats: getPlayerStats(p, currentCategory)
      }))
      .sort((a, b) => b.stats.points - a.stats.points)
  }, [playersData, currentGender, currentProvinceFilter, currentSearchTerm, currentCategory, getPlayerStats])

  const top10 = rankedPlayers.slice(0, TOP_PLAYERS_COUNT)
  const remaining = rankedPlayers.slice(TOP_PLAYERS_COUNT)

  const avgLabel = useMemo(() => 
    currentCategory === 'batting'
      ? 'Batting Avg'
      : currentCategory === 'bowling'
      ? 'Bowling Avg'
      : 'All-Round Index'
  , [currentCategory])

  const renderPlayerRow = (player: PlayerWithStats, rank: number) => {
    const rankClass = rank <= 3 && !currentSearchTerm ? `rank-${rank}` : ''
    const isTop3 = rank <= 3 && !currentSearchTerm
    
    return (
      <div key={player.id}>
        <div className={`ranking-table player-row ${rankClass}`}>
          <div className="rank-badge">
            {isTop3 && (
              <span className="trophy-icon" aria-label={`${rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : 'Bronze'} trophy`}>
                {rank === 1 && '🏆'}
                {rank === 2 && '🥈'}
                {rank === 3 && '🥉'}
              </span>
            )}
            {rank}
          </div>
          <div className="player-info">
            <i className="fas fa-user-circle"></i>
            <div className="player-details">
              <span className="player-name">{player.full_name}</span>
              <span className="player-id">ID: {player.id.substring(0, 8)}...</span>
            </div>
          </div>
          <div>
            <span className="province-tag">{player.province}</span>
          </div>
          <div className="points-score">{player.stats.points.toLocaleString()}</div>
          <div className="avg-score">{player.stats.average}</div>
        </div>
        {currentCategory === 'allrounder' && !currentSearchTerm && (
          <div className="ranking-table player-row allrounder-details-row" key={`${player.id}-details`}>
            <div></div>
            <div>
              <i className="fas fa-chart-line" style={{ color: 'var(--color-accent-gold)', marginRight: '5px' }}></i>
              <span style={{ color: 'var(--color-accent-gold)' }}>Performance Breakdown:</span>{' '}
              {player.stats.detail}
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleGenderChange = (gender: Gender) => {
    setCurrentGender(gender)
    setIsRemainingOpen(false)
  }

  const handleCategoryChange = (category: Category) => {
    setCurrentCategory(category)
    setIsRemainingOpen(false)
  }

  const handleProvinceFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentProvinceFilter(e.target.value)
    setIsRemainingOpen(false)
  }

  const clearSearch = () => {
    setCurrentSearchTerm('')
  }

  const refreshData = async () => {
    await loadAllPlayers()
  }

  const currentPlayersCount = playersData[currentGender]?.length || 0
  const totalPlayers = playersData.male.length + playersData.female.length

  return (
    <>
      <style jsx global>{`
        /* ==================== GLOBAL STYLES ==================== */
        :root {
          --color-dark-primary: #000000;
          --color-accent-gold: #FFD700;
          --color-light-text: #eaf3fb;
          --color-white: #fff;
          --color-blue-dark-bg: #0c0c0c;
          --color-card-bg: #151515;
          --color-search-green: #53e51a;
          --color-rank-1: #FFD700;
          --color-rank-2: #C0C0C0;
          --color-rank-3: #CD7F32;
          --color-boys-active: #1e88e5;
          --color-girls-active: #e91e63;
          --color-gold-yellow: #FFD700;
          --color-dark-yellow: #FFC107;
          --color-yellow-500: #FFD700;
          --color-yellow-400: #FFC107;
          --color-error-red: #ff4444;
          --color-warning-orange: #ff9800;
          --color-success-green: #4CAF50;
          --color-info-blue: #2196F3;

          --spacing-large: 40px;
          --spacing-medium: 50px;
          --radius-medium: 45px;
          --radius-circle: 60%;
        }

        body {
          margin: 0;
          padding: 0;
          background: var(--color-blue-dark-bg);
          color: var(--color-light-text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Error Banner */
        .error-banner {
          background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 152, 0, 0.1));
          border: 1px solid var(--color-error-red);
          border-radius: 8px;
          padding: 15px 20px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .error-banner .banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .error-banner .banner-content i {
          color: var(--color-error-red);
          font-size: 20px;
        }

        .error-banner .banner-message {
          font-size: 14px;
          font-weight: 500;
        }

        .retry-button {
          background: linear-gradient(135deg, var(--color-info-blue), #1976D2);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        /* Page Header */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 20px;
          margin: var(--spacing-large) auto 30px;
          position: relative;
          padding-bottom: 20px;
          width: 100%;
          text-align: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0px;
          margin-top: 60px; 
        }

        .logo-container img {
          width: 150px;
          height: 150px;
          border-radius: var(--radius-circle);
          object-fit: contain;
          border: 0px solid var(--color-accent-gold);
          padding: 0px;
          background: var(--color-card-bg);
        }

        .main-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .title-text {
          font-weight: 800;
          font-size: 42px;
          color: var(--color-yellow-500);
          letter-spacing: 2px;
          text-transform: uppercase;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          margin: 0;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 16px;
          color: var(--color-yellow-400);
          font-weight: 400;
          letter-spacing: 6px;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .page-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 80%;
          max-width: 500px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-gold-yellow), transparent);
          border-radius: 8px;
        }

        .player-count-badge {
          background: linear-gradient(135deg, var(--color-gold-yellow), var(--color-dark-yellow));
          color: var(--color-dark-primary);
          padding: 8px 20px;
          border-radius: 25px;
          font-weight: 800;
          font-size: 14px;
          margin-top: 10px;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Gender Selector */
        .gender-selection-bar {
          max-width: 700px;
          margin: 0 auto 30px;
          text-align: center;
          padding: 15px;
          background: linear-gradient(135deg, rgba(12, 12, 12, 0.9), rgba(21, 21, 21, 0.9));
          border-radius: var(--radius-medium);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          gap: 20px;
          border: 1px solid rgba(255, 215, 0, 0.1);
        }

        .gender-btn {
          background: linear-gradient(135deg, var(--color-card-bg), #1a1a1a);
          color: var(--color-white);
          border: 2px solid transparent;
          padding: 12px 30px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.3s ease;
          min-width: 150px;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .gender-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .gender-btn.active-male {
          background: linear-gradient(135deg, var(--color-boys-active), #1565c0);
          border-color: var(--color-boys-active);
          box-shadow: 0 0 20px rgba(30, 136, 229, 0.4);
        }

        .gender-btn.active-female {
          background: linear-gradient(135deg, var(--color-girls-active), #c2185b);
          border-color: var(--color-girls-active);
          box-shadow: 0 0 20px rgba(233, 30, 99, 0.4);
        }

        /* Controls Bar */
        .controls-bar {
          background: linear-gradient(135deg, var(--color-blue-dark-bg), #111111);
          border-radius: var(--radius-medium);
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 215, 0, 0.1);
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }

        .ranking-nav {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ranking-nav button {
          background: linear-gradient(135deg, var(--color-card-bg), #1a1a1a);
          color: var(--color-light-text);
          border: 1px solid rgba(255, 215, 0, 0.2);
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 120px;
          justify-content: center;
        }

        .ranking-nav button:hover {
          transform: translateY(-2px);
          border-color: var(--color-accent-gold);
        }

        .ranking-nav button.active {
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-dark-yellow));
          color: var(--color-dark-primary);
          font-weight: 900;
          border-color: var(--color-accent-gold);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-group label {
          font-weight: 700;
          font-size: 14px;
          color: var(--color-accent-gold);
        }

        .filter-group select {
          padding: 8px 16px;
          border-radius: 6px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          background: linear-gradient(135deg, var(--color-card-bg), #1a1a1a);
          color: var(--color-light-text);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          appearance: none;
          background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFD700%22%20d%3D%22M287%2069.9%20146.2%20210.8%205.4%2069.9z%22%2F%3E%3C%2Fsvg%3E');
          background-repeat: no-repeat, repeat;
          background-position: right 10px top 50%, 0 0;
          background-size: 12px auto, 100%;
          min-width: 180px;
        }

        .filter-group select:focus {
          outline: none;
          border-color: var(--color-accent-gold);
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.2);
        }

        .search-portal {
          display: flex;
          gap: 10px;
          align-items: center;
          width: 100%;
          background: rgba(21, 21, 21, 0.8);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .search-portal i {
          color: var(--color-accent-gold);
          font-size: 18px;
        }

        .search-portal input {
          flex-grow: 1;
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid rgba(255, 215, 0, 0.2);
          background: rgba(0, 0, 0, 0.5);
          color: var(--color-light-text);
          font-size: 15px;
          transition: all 0.3s;
        }

        .search-portal input:focus {
          outline: none;
          border-color: var(--color-accent-gold);
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.2);
          background: rgba(0, 0, 0, 0.7);
        }

        .clear-search {
          background: transparent;
          border: none;
          color: var(--color-accent-gold);
          cursor: pointer;
          padding: 5px 8px;
          font-size: 16px;
          transition: all 0.3s;
        }

        .clear-search:hover {
          color: var(--color-white);
          transform: scale(1.1);
        }

        /* Ranking Table */
        .ranking-list-container {
          min-height: 500px;
          background: linear-gradient(135deg, var(--color-blue-dark-bg), #111111);
          padding: var(--spacing-medium);
          border-radius: var(--radius-medium);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8);
          overflow-x: auto;
          border: 1px solid rgba(255, 215, 0, 0.1);
          position: relative;
          margin-bottom: 30px;
        }

        .ranking-table {
          display: grid;
          grid-template-columns: 0.3fr 2.5fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 12px 0;
          font-size: 15px;
          min-width: 800px;
        }

        .ranking-header {
          font-weight: 900;
          color: var(--color-accent-gold);
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 2px solid rgba(255, 215, 0, 0.3);
          text-transform: uppercase;
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, var(--color-blue-dark-bg), #111111);
          z-index: 10;
          font-size: 16px;
          letter-spacing: 0.5px;
        }

        .player-row {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
          align-items: center;
          transition: all 0.3s ease;
        }

        .player-row:hover {
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.05), transparent);
          transform: translateX(5px);
          border-left: 3px solid var(--color-accent-gold);
          padding-left: 10px;
        }

        .rank-badge {
          font-weight: 900;
          font-size: 20px;
          color: var(--color-light-text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .trophy-icon {
          font-size: 18px;
        }

        .rank-1 .rank-badge {
          color: var(--color-rank-1);
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
        }

        .rank-2 .rank-badge {
          color: var(--color-rank-2);
          text-shadow: 0 0 8px rgba(192, 192, 192, 0.5);
        }

        .rank-3 .rank-badge {
          color: var(--color-rank-3);
          text-shadow: 0 0 8px rgba(205, 127, 50, 0.5);
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .player-info i {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-card-bg), #1a1a1a);
          color: var(--color-accent-gold);
          font-size: 18px;
          border: 2px solid rgba(255, 215, 0, 0.3);
        }

        .player-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .player-name {
          font-weight: 700;
          font-size: 15px;
          color: var(--color-white);
        }

        .player-id {
          font-size: 11px;
          color: var(--color-accent-gold);
          opacity: 0.8;
        }

        .province-tag {
          font-size: 12px;
          padding: 5px 10px;
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-dark-yellow));
          color: var(--color-dark-primary);
          border-radius: 5px;
          font-weight: 800;
          width: fit-content;
          display: inline-block;
          text-align: center;
          min-width: 90px;
        }

        .points-score,
        .avg-score {
          font-weight: 800;
          color: var(--color-search-green);
          font-size: 16px;
          text-shadow: 0 0 4px rgba(83, 229, 26, 0.3);
        }

        .allrounder-details-row {
          grid-template-columns: 0.3fr 4fr 1fr;
          padding: 8px 0 12px 0;
          border-bottom: none;
          background: rgba(255, 215, 0, 0.03);
          border-radius: 6px;
          margin-top: 5px;
        }

        .allrounder-details-row > div {
          grid-column: 2 / span 4;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          padding-left: 52px;
          font-weight: 500;
        }

        .collapsible-button {
          display: block;
          width: 100%;
          text-align: center;
          padding: 15px;
          margin-top: 15px;
          background: linear-gradient(135deg, var(--color-card-bg), #1a1a1a);
          color: var(--color-accent-gold);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: var(--radius-medium);
          cursor: pointer;
          font-weight: 800;
          font-size: 15px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .collapsible-button:hover {
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-dark-yellow));
          color: var(--color-dark-primary);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
          border-color: var(--color-accent-gold);
        }

        .collapsible-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease-in-out;
          padding: 0;
        }

        .collapsible-content.open {
          max-height: 5000px;
          padding-top: 12px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 215, 0, 0.1);
          border-top: 4px solid var(--color-accent-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-data {
          color: var(--color-accent-gold);
          text-align: center;
          padding: 40px;
          font-size: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .stats-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 215, 0, 0.2);
          flex-wrap: wrap;
          gap: 15px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 80px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 900;
          color: var(--color-accent-gold);
        }

        .stat-label {
          font-size: 12px;
          color: var(--color-light-text);
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .refresh-button {
          background: linear-gradient(135deg, var(--color-card-bg), #1a1a1a);
          color: var(--color-accent-gold);
          border: 1px solid rgba(255, 215, 0, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          margin-left: 10px;
        }

        .refresh-button:hover {
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-dark-yellow));
          color: var(--color-dark-primary);
          transform: translateY(-2px);
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .ranking-table { min-width: 700px; }
          .gender-selection-bar { max-width: 90%; gap: 15px; }
          .gender-btn { min-width: 140px; padding: 10px 20px; }
        }

        @media (max-width: 768px) {
          .page-header { padding: 0 15px 20px 15px; gap: 20px; }
          .title-text { font-size: 28px; }
          .subtitle { font-size: 14px; }
          .gender-selection-bar { flex-direction: column; gap: 10px; padding: 12px; }
          .top-row { flex-direction: column; align-items: stretch; gap: 12px; }
          .ranking-nav { width: 100%; justify-content: space-between; }
          .ranking-nav button { font-size: 12px; padding: 8px 12px; min-width: 100px; }
          .filter-group { width: 100%; justify-content: space-between; }
          .filter-group select { min-width: 140px; font-size: 13px; }
          .ranking-table { min-width: 600px; grid-template-columns: 0.4fr 2fr 0.8fr 0.8fr 0.8fr; font-size: 14px; }
          .stats-summary { justify-content: center; gap: 15px; }
          .stat-item { min-width: 70px; }
          .stat-value { font-size: 20px; }
        }

        @media (max-width: 480px) {
          .title-text { font-size: 24px; }
          .subtitle { font-size: 12px; }
          .gender-btn { min-width: 100%; padding: 12px; font-size: 14px; }
          .player-count-badge { font-size: 12px; padding: 6px 12px; }
          .ranking-table { min-width: 500px; font-size: 13px; }
        }
      `}</style>

      <main>
        {/* Page Header */}
        <div className="page-header">
          <div className="logo-container">
            <Image 
              src="/image55.png" 
              alt="Path of Cricket Logo" 
              width={150}
              height={150}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          <div className="main-title">
            <h1 className="title-text">PATH OF CRICKET</h1>
            <div className="subtitle">PROVINCIAL PERFORMANCE RANKING PORTAL</div>
          </div>
          
          <div className="player-count-badge">
            <i className="fas fa-users"></i>
            TOTAL PLAYERS: {totalPlayers.toLocaleString()} | {currentGender === 'male' ? 'BOYS' : 'GIRLS'}: {currentPlayersCount.toLocaleString()}
          </div>
        </div>

        <div className="container">
          {/* Error Banner */}
          {error && (
            <div className="error-banner">
              <div className="banner-content">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="banner-message">{error}</div>
              </div>
              <button className="retry-button" onClick={refreshData} disabled={isLoading}>
                <i className="fas fa-sync-alt"></i> Retry
              </button>
            </div>
          )}

          {/* Stats Summary */}
          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-value">{totalPlayers.toLocaleString()}</div>
              <div className="stat-label">Total Players</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{PROVINCES.length}</div>
              <div className="stat-label">Provinces</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{playersData.male.length.toLocaleString()}</div>
              <div className="stat-label">Boys</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{playersData.female.length.toLocaleString()}</div>
              <div className="stat-label">Girls</div>
            </div>
            <button 
              className="refresh-button" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Gender Selection */}
          <div className="gender-selection-bar">
            <button
              className={`gender-btn ${currentGender === 'male' ? 'active-male' : ''}`}
              onClick={() => handleGenderChange('male')}
              disabled={isLoading}
            >
              <i className="fas fa-male"></i>
              Boys Rankings ({playersData.male.length.toLocaleString()} Players)
            </button>
            <button
              className={`gender-btn ${currentGender === 'female' ? 'active-female' : ''}`}
              onClick={() => handleGenderChange('female')}
              disabled={isLoading}
            >
              <i className="fas fa-female"></i>
              Girls Rankings ({playersData.female.length.toLocaleString()} Players)
            </button>
          </div>

          {/* Controls Bar */}
          <div className="controls-bar">
            <div className="top-row">
              <nav className="ranking-nav">
                <button
                  className={currentCategory === 'batting' ? 'active' : ''}
                  onClick={() => handleCategoryChange('batting')}
                  disabled={isLoading}
                >
                  <i className="fas fa-baseball-ball"></i> Batting
                </button>
                <button
                  className={currentCategory === 'bowling' ? 'active' : ''}
                  onClick={() => handleCategoryChange('bowling')}
                  disabled={isLoading}
                >
                  <i className="fas fa-hand-holding-water"></i> Bowling
                </button>
                <button
                  className={currentCategory === 'allrounder' ? 'active' : ''}
                  onClick={() => handleCategoryChange('allrounder')}
                  disabled={isLoading}
                >
                  <i className="fas fa-star"></i> All-Rounder
                </button>
              </nav>

              <div className="filter-group">
                <label htmlFor="province-filter">Filter Province:</label>
                <select
                  id="province-filter"
                  value={currentProvinceFilter}
                  onChange={handleProvinceFilterChange}
                  disabled={isLoading}
                >
                  <option value="All">All Provinces ({currentPlayersCount.toLocaleString()} Players)</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>
                      {p} ({playersData[currentGender]?.filter(player => player.province === p).length || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="search-portal">
              <i className="fas fa-search"></i>
              <input
                type="text"
                id="player-search"
                placeholder="Search by player name, ID, or province..."
                value={currentSearchTerm}
                onChange={(e) => setCurrentSearchTerm(e.target.value)}
                disabled={isLoading}
              />
              {currentSearchTerm && (
                <button 
                  className="clear-search"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Ranking Table */}
          <div className="ranking-list-container">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div style={{ color: 'var(--color-accent-gold)', fontSize: '16px', textAlign: 'center' }}>
                  Loading {currentGender === 'male' ? 'Boys' : 'Girls'} rankings... ({currentPlayersCount.toLocaleString()} players)
                </div>
              </div>
            ) : (
              <>
                <div className="ranking-table ranking-header">
                  <div>Rank</div>
                  <div>Player Details</div>
                  <div>Province</div>
                  <div>Points</div>
                  <div>{avgLabel}</div>
                </div>

                <div id="ranking-content">
                  <div id="top-10-list">
                    {currentSearchTerm ? (
                      rankedPlayers.length === 0 ? (
                        <div className="no-data">
                          <i className="fas fa-search" style={{ fontSize: '36px' }}></i>
                          <div>No {currentGender === 'male' ? 'Boys' : 'Girls'} players found for "{currentSearchTerm}"</div>
                          <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '5px' }}>
                            Try searching by name, ID, or province
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ 
                            color: 'var(--color-search-green)', 
                            margin: '15px 0 8px 0',
                            padding: '8px 12px',
                            background: 'rgba(83, 229, 26, 0.1)',
                            borderRadius: '6px',
                            borderLeft: '4px solid var(--color-search-green)',
                            fontSize: '14px'
                          }}>
                            <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
                            Found {rankedPlayers.length.toLocaleString()} player(s) for "{currentSearchTerm}"
                          </div>
                          {rankedPlayers.map((p, i) => renderPlayerRow(p, i + 1))}
                        </>
                      )
                    ) : (
                      <>
                        {top10.length > 0 && (
                          <div style={{ 
                            color: 'var(--color-accent-gold)', 
                            margin: '12px 0',
                            padding: '8px',
                            textAlign: 'center',
                            fontWeight: '700',
                            fontSize: '16px',
                            borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
                            background: 'rgba(255, 215, 0, 0.05)',
                            borderRadius: '4px'
                          }}>
                            TOP 10 PLAYERS - {currentGender === 'male' ? 'BOYS' : 'GIRLS'} {currentCategory.toUpperCase()} RANKINGS
                          </div>
                        )}
                        {top10.map((p, i) => renderPlayerRow(p, i + 1))}
                      </>
                    )}
                  </div>

                  {!currentSearchTerm && remaining.length > 0 && (
                    <>
                      <button
                        className="collapsible-button"
                        onClick={() => setIsRemainingOpen(!isRemainingOpen)}
                        aria-expanded={isRemainingOpen}
                        disabled={isLoading}
                      >
                        <i className={`fas fa-chevron-${isRemainingOpen ? 'up' : 'down'}`}></i>{' '}
                        {isRemainingOpen 
                          ? `Hide Remaining ${remaining.length.toLocaleString()} Players` 
                          : `Show Remaining ${remaining.length.toLocaleString()} Players (Rank 11-${rankedPlayers.length})`
                        }
                      </button>
                      <div className={`collapsible-content ${isRemainingOpen ? 'open' : ''}`}>
                        {remaining.map((p, i) => renderPlayerRow(p, TOP_PLAYERS_COUNT + i + 1))}
                      </div>
                    </>
                  )}

                  {!currentSearchTerm && top10.length > 0 && remaining.length === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px',
                      color: 'var(--color-accent-gold)',
                      opacity: 0.8
                    }}>
                      <i className="fas fa-trophy" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
                      <div style={{ fontSize: '16px' }}>All {rankedPlayers.length.toLocaleString()} players displayed</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}