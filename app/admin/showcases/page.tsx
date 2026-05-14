'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client.ts';

interface Match {
  id: string;
  match_code: string;
  gender: 'boys' | 'girls';
  stage: string;
  title: string;
  match_date: string;
  match_time: string;
  umpires: string;
  status: string;
  ground_name: string;
  team1_name: string;
  team2_name: string;
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Partial<Match>>({ gender: 'boys' });
  const [showForm, setShowForm] = useState(false);


  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false }); // Order by date, newest first

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const matchData = { ...editingMatch };

      
      if (!matchData.id) delete matchData.id;

      let error;
      if (editingMatch.id) {
      
        const { error: updateError } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', editingMatch.id);
        error = updateError;
      } else {
      
        const { error: insertError } = await supabase
          .from('matches')
          .insert([matchData]);
        error = insertError;
      }

      if (error) throw error;


      setEditingMatch({ gender: 'boys' });
      setShowForm(false);
      await fetchMatches();

     
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('matches-updated'));
      }
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Error saving match. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchMatches();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('matches-updated'));
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Error deleting match.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (match: Match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingMatch({ gender: 'boys' });
    setShowForm(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>Matches Management</h1>
      
      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ 
          background: '#d1b042', 
          color: '#000', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}
      >
        {showForm ? 'Close Form' : '+ Add New Match'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          background: '#1a1a1a', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px'
        }}>
          <input type="hidden" name="id" value={editingMatch.id || ''} />
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Match Code *</label>
            <input
              required
              placeholder="e.g., M001"
              value={editingMatch.match_code || ''}
              onChange={e => setEditingMatch({...editingMatch, match_code: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Gender *</label>
            <select
              required
              value={editingMatch.gender}
              onChange={e => setEditingMatch({...editingMatch, gender: e.target.value as 'boys'|'girls'})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            >
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Stage</label>
            <input
              placeholder="e.g., Quarter-Final"
              value={editingMatch.stage || ''}
              onChange={e => setEditingMatch({...editingMatch, stage: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Title *</label>
            <input
              required
              placeholder="e.g., Western Province vs Central Province"
              value={editingMatch.title || ''}
              onChange={e => setEditingMatch({...editingMatch, title: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Match Date</label>
            <input
              type="date"
              value={editingMatch.match_date || ''}
              onChange={e => setEditingMatch({...editingMatch, match_date: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Match Time</label>
            <input
              type="time"
              value={editingMatch.match_time || ''}
              onChange={e => setEditingMatch({...editingMatch, match_time: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Umpires</label>
            <input
              placeholder="e.g., K. Dharmasena, R. Palliyaguruge"
              value={editingMatch.umpires || ''}
              onChange={e => setEditingMatch({...editingMatch, umpires: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Status</label>
            <select
              value={editingMatch.status || 'scheduled'}
              onChange={e => setEditingMatch({...editingMatch, status: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Ground Name</label>
            <input
              placeholder="e.g., SSC, Colombo"
              value={editingMatch.ground_name || ''}
              onChange={e => setEditingMatch({...editingMatch, ground_name: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Team 1 Name</label>
            <input
              placeholder="e.g., Western Province"
              value={editingMatch.team1_name || ''}
              onChange={e => setEditingMatch({...editingMatch, team1_name: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#d1b042' }}>Team 2 Name</label>
            <input
              placeholder="e.g., Central Province"
              value={editingMatch.team2_name || ''}
              onChange={e => setEditingMatch({...editingMatch, team2_name: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={handleCancel}
              style={{ 
                background: '#555', 
                color: '#fff', 
                padding: '10px 20px', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: '#d1b042', 
                color: '#000', 
                padding: '10px 20px', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Saving...' : (editingMatch.id ? 'Update Match' : 'Create Match')}
            </button>
          </div>
        </form>
      )}

      {loading && !showForm && <p>Loading...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#1a1a1a' }}>
        <thead>
          <tr style={{ background: '#333' }}>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Code</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Gender</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Title</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Time</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#d1b042' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '12px' }}>{match.match_code}</td>
              <td style={{ padding: '12px' }}>{match.gender === 'boys' ? 'Boys' : 'Girls'}</td>
              <td style={{ padding: '12px' }}>{match.title}</td>
              <td style={{ padding: '12px' }}>{match.match_date}</td>
              <td style={{ padding: '12px' }}>{match.match_time}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  background: match.status === 'completed' ? '#4CAF50' : (match.status === 'scheduled' ? '#FFC107' : '#F44336'),
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {match.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <button 
                  onClick={() => handleEdit(match)}
                  style={{ 
                    background: '#2196F3', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '5px 10px', 
                    borderRadius: '4px',
                    marginRight: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(match.id)}
                  style={{ 
                    background: '#F44336', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '5px 10px', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {matches.length === 0 && !loading && (
            <tr>
              <td colSpan={7} style={{ padding: '20px', textAlign: 'center' }}>No matches found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}