"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase-client";

interface Player {
  id: string;
  name: string;
  rank: number;
  score: number;
}

export default function TopPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, rank, score')
      .order('rank', { ascending: true })
      .limit(10);

    if (!error && data) setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Top Players</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player, index) => (
          <div key={player.id} className="p-4 border rounded shadow hover:shadow-lg transition">
            <h3 className="font-semibold">{index + 1}. {player.name}</h3>
            <p>Rank: {player.rank}</p>
            <p>Score: {player.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
