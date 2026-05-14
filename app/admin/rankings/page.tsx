'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'   

const PROVINCES = [
  'Western', 'Southern', 'Central', 'Northern', 'Eastern',
  'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
] as const

type Gender = 'male' | 'female'


interface Player {
  id: string
  full_name: string
  email?: string | null
  province: typeof PROVINCES[number]
  gender: Gender
  runs: number
  wickets: number
  fifties: number
  catches: number
  matches_played: number
  highest_score?: number | null
  best_bowling?: string | null
  batting_points: number
  bowling_points: number
  allrounder_points: number
  created_at: string
}

interface PlayerForm {
  id?: string
  full_name: string
  email: string
  province: typeof PROVINCES[number]
  gender: Gender
  runs: number
  wickets: number
  fifties: number
  catches: number
  matches_played: number
  highest_score?: number | null
  best_bowling?: string | null
}

const initialForm: PlayerForm = {
  full_name: '',
  email: '',
  province: 'Western',
  gender: 'male',
  runs: 0,
  wickets: 0,
  fifties: 0,
  catches: 0,
  matches_played: 4,
  highest_score: null,
  best_bowling: ''
}

const calculatePoints = (form: PlayerForm) => {
  const battingPoints =
    form.runs * 2 +
    form.fifties * 50 +
    (form.runs > 200 ? 100 : 0)

  const bowlingPoints =
    form.wickets * 100 +
    form.catches * 25 +
    (form.wickets > 20 ? (form.wickets - 20) * 75 : 0) +
    (form.wickets > 15 ? 50 : 0)

  const allrounderPoints =
    Math.round(form.runs * 1.8) +
    form.wickets * 85 +
    form.catches * 30 +
    (form.runs > 150 && form.wickets > 10 ? 200 : 0)

  return { battingPoints, bowlingPoints, allrounderPoints }
}

export default function AdminRankingPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [form, setForm] = useState<PlayerForm>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)


  const [searchTerm, setSearchTerm] = useState('')
  const [filterGender, setFilterGender] = useState<'all' | Gender>('all')

  
  const mountedRef = useRef(true)
  const latestRequestIdRef = useRef(0)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  const channelRef = useRef<any>(null)

  
  const pointsPreview = useMemo(() => calculatePoints(form), [form])


  const fetchPlayers = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
    
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        setPlayers(data || [])
      } else {
        console.log(`Ignoring stale player data (requestId ${requestId})`)
      }
    } catch (err: any) {
      if (requestId === latestRequestIdRef.current && mountedRef.current) {
        showMessage('error', `Failed to load players: ${err.message}`)
      }
    }
  }, [])

 
  useEffect(() => {
    mountedRef.current = true
    fetchPlayers()

    const channelName = `admin-players-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        () => {
 
          if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
          refreshTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              fetchPlayers()
            }
          }, 500)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected:', channelName)
        } else if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel error, will retry')
        }
      })

    channelRef.current = channel

    return () => {
      mountedRef.current = false
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {})
        channelRef.current = null
      }
    }
  }, [fetchPlayers])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseInt(value) || 0) : value
    }))
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      showMessage('error', 'Player name is required')
      return
    }

    const { battingPoints, bowlingPoints, allrounderPoints } = calculatePoints(form)

    setLoading(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('players')
          .update({
            full_name: form.full_name.trim(),
            email: form.email.trim() || null,
            province: form.province,
            gender: form.gender,
            runs: form.runs,
            wickets: form.wickets,
            fifties: form.fifties,
            catches: form.catches,
            matches_played: form.matches_played,
            highest_score: form.highest_score || null,
            best_bowling: form.best_bowling?.trim() || null,
            batting_points: battingPoints,
            bowling_points: bowlingPoints,
            allrounder_points: allrounderPoints
          })
          .eq('id', editingId)

        if (error) throw error
        showMessage('success', 'Player updated successfully')
      } else {
        const { error } = await supabase
          .from('players')
          .insert([{
            full_name: form.full_name.trim(),
            email: form.email.trim() || null,
            province: form.province,
            gender: form.gender,
            runs: form.runs,
            wickets: form.wickets,
            fifties: form.fifties,
            catches: form.catches,
            matches_played: form.matches_played,
            highest_score: form.highest_score || null,
            best_bowling: form.best_bowling?.trim() || null,
            batting_points: battingPoints,
            bowling_points: bowlingPoints,
            allrounder_points: allrounderPoints
          }])

        if (error) throw error
        showMessage('success', 'Player added successfully')
      }

      setForm(initialForm)
      setEditingId(null)
      await fetchPlayers()
    } catch (err: any) {
      showMessage('error', `Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (player: Player) => {
    setForm({
      id: player.id,
      full_name: player.full_name,
      email: player.email || '',
      province: player.province || 'Western',
      gender: player.gender || 'male',
      runs: player.runs,
      wickets: player.wickets,
      fifties: player.fifties,
      catches: player.catches,
      matches_played: player.matches_played,
      highest_score: player.highest_score,
      best_bowling: player.best_bowling
    })
    setEditingId(player.id)
  }

 
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('players').delete().eq('id', id)
      if (error) throw error
      showMessage('success', 'Player deleted')
      await fetchPlayers()
    } catch (err: any) {
      showMessage('error', `Delete failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  
  const handleCancel = () => {
    setForm(initialForm)
    setEditingId(null)
  }


  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesSearch =
        searchTerm === '' ||
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGender = filterGender === 'all' || p.gender === filterGender
      return matchesSearch && matchesGender
    })
  }, [players, searchTerm, filterGender])

 
  const containerStyle = {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    color: '#eaf3fb',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }

  const headerStyle = {
    color: '#FFD700',
    textAlign: 'center' as const,
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px'
  }

  const messageStyle = {
    background: message?.type === 'error' ? '#ff4444' : '#4CAF50',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }

  const formCardStyle = {
    background: '#111',
    padding: '25px',
    borderRadius: '15px',
    marginBottom: '30px',
    border: '1px solid rgba(255,215,0,0.2)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
  }

  const formTitleStyle = {
    color: '#FFD700',
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '1.5rem',
    fontWeight: 700,
    borderBottom: '2px solid #FFD700',
    paddingBottom: '10px'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px'
  }

  const inputStyle = {
    padding: '10px 12px',
    background: '#222',
    border: '1px solid #FFD700',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box' as const
  }

  const previewBoxStyle = {
    background: '#1a1a1a',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '20px',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap' as const,
    border: '1px solid #FFD700'
  }

  const previewItemStyle = {
    flex: '1 1 150px',
    textAlign: 'center' as const
  }

  const previewLabelStyle = {
    color: '#FFD700',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    fontWeight: 600
  }

  const previewValueStyle = {
    fontSize: '24px',
    fontWeight: 800,
    color: '#53e51a'
  }

  const buttonStyle = {
    padding: '10px 20px',
    background: '#FFD700',
    border: 'none',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#666',
    color: '#fff'
  }

  const actionButtonStyle = {
    padding: '5px 12px',
    margin: '0 4px',
    background: '#FFD700',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px'
  }

  const deleteButtonStyle = {
    ...actionButtonStyle,
    background: '#f44336',
    color: '#fff'
  }

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: '#111',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
  }

  const thStyle = {
    padding: '12px 8px',
    textAlign: 'left' as const,
    borderBottom: '2px solid #FFD700',
    color: '#FFD700',
    fontWeight: 700,
    fontSize: '14px'
  }

  const tdStyle = {
    padding: '10px 8px',
    borderBottom: '1px solid #333',
    color: '#fff',
    fontSize: '14px'
  }

  const filterBarStyle = {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    alignItems: 'center'
  }

  const searchInputStyle = {
    ...inputStyle,
    flex: '2',
    minWidth: '250px'
  }

  const selectStyle = {
    ...inputStyle,
    width: 'auto',
    minWidth: '120px'
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>⚡ Player Performance Admin ⚡</h1>

      {message && (
        <div style={messageStyle}>
          <i className="fas fa-info-circle"></i>
          {message.text}
        </div>
      )}

      <div style={formCardStyle}>
        <h2 style={formTitleStyle}>
          {editingId ? '✏️ Edit Player' : '➕ Add New Player'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            <input
              name="full_name"
              placeholder="Full Name *"
              value={form.full_name}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              value={form.email}
              onChange={handleChange}
              style={inputStyle}
            />
            <select name="province" value={form.province} onChange={handleChange} style={inputStyle}>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
              <option value="male">Boys</option>
              <option value="female">Girls</option>
            </select>
            <input
              name="runs"
              type="number"
              placeholder="Runs"
              min="0"
              value={form.runs}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="wickets"
              type="number"
              placeholder="Wickets"
              min="0"
              value={form.wickets}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="fifties"
              type="number"
              placeholder="Fifties"
              min="0"
              value={form.fifties}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="catches"
              type="number"
              placeholder="Catches"
              min="0"
              value={form.catches}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="matches_played"
              type="number"
              placeholder="Matches"
              min="1"
              value={form.matches_played}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="highest_score"
              type="number"
              placeholder="Highest Score"
              min="0"
              value={form.highest_score || ''}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="best_bowling"
              placeholder="Best Bowling (e.g., 3/28)"
              value={form.best_bowling || ''}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={previewBoxStyle}>
            <div style={previewItemStyle}>
              <div style={previewLabelStyle}>Batting Points</div>
              <div style={previewValueStyle}>{pointsPreview.battingPoints}</div>
            </div>
            <div style={previewItemStyle}>
              <div style={previewLabelStyle}>Bowling Points</div>
              <div style={previewValueStyle}>{pointsPreview.bowlingPoints}</div>
            </div>
            <div style={previewItemStyle}>
              <div style={previewLabelStyle}>All-Rounder Points</div>
              <div style={previewValueStyle}>{pointsPreview.allrounderPoints}</div>
            </div>
            <div style={{ flex: '1', textAlign: 'right', alignSelf: 'center' }}>
              <small style={{ color: '#aaa' }}>Preview – actual points are saved to the database.</small>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? (
                <>⏳ Saving...</>
              ) : editingId ? (
                <>✏️ Update Player</>
              ) : (
                <>✅ Add Player</>
              )}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={cancelButtonStyle}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ background: '#111', padding: '20px', borderRadius: '15px' }}>
        <h2 style={{ color: '#FFD700', marginTop: 0, marginBottom: '20px' }}>📋 Player List</h2>

        <div style={filterBarStyle}>
          <input
            type="text"
            placeholder="Search by name, province or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as any)}
            style={selectStyle}
          >
            <option value="all">All Genders</option>
            <option value="male">Boys</option>
            <option value="female">Girls</option>
          </select>
          <span style={{ color: '#FFD700' }}>
            {filteredPlayers.length} / {players.length} players
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Province</th>
                <th style={thStyle}>Gender</th>
                <th style={thStyle}>Runs</th>
                <th style={thStyle}>Wkts</th>
                <th style={thStyle}>BatPts</th>
                <th style={thStyle}>BowlPts</th>
                <th style={thStyle}>AllPts</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map(p => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.full_name}</td>
                  <td style={tdStyle}>{p.email || '-'}</td>
                  <td style={tdStyle}>{p.province}</td>
                  <td style={tdStyle}>
                    {p.gender === 'male' ? '♂️ Boys' : '♀️ Girls'}
                  </td>
                  <td style={tdStyle}>{p.runs}</td>
                  <td style={tdStyle}>{p.wickets}</td>
                  <td style={{ ...tdStyle, color: '#53e51a', fontWeight: 700 }}>{p.batting_points}</td>
                  <td style={{ ...tdStyle, color: '#53e51a', fontWeight: 700 }}>{p.bowling_points}</td>
                  <td style={{ ...tdStyle, color: '#53e51a', fontWeight: 700 }}>{p.allrounder_points}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(p)} style={actionButtonStyle}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={deleteButtonStyle}>Del</button>
                  </td>
                </tr>
              ))}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', padding: '30px', color: '#aaa' }}>
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}