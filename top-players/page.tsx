'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TopPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const fetchTopPlayers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('player_rank', { ascending: true }) 
      .limit(50); 

    if (error) {
      console.error('Error fetching top players:', error);
      setLoading(false);
      return;
    }

    setPlayers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTopPlayers(); 

  
    const subscription = supabase
      .channel('public:players')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        (payload) => {
      
          fetchTopPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); 
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆 Top Players (Realtime)</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Rank</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Player</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '0.5rem' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{p.player_rank}</td>
                <td style={{ padding: '0.5rem' }}>{p.player_name}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{p.player_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
