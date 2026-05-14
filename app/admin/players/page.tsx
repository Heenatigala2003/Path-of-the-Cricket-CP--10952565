"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function PlayersAdmin() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("players").select("*");
    setPlayers(data || []);
  }

  async function approve(id:string) {
    await supabase.from("players")
      .update({ approved: true })
      .eq("id", id);
    load();
  }

  async function remove(id:string) {
    await supabase.from("players").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl text-yellow-400 mb-4">Players</h1>
      <table className="w-full bg-gray-900">
        <thead>
          <tr><th>Name</th><th>District</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.id}>
              <td>{p.full_name}</td>
              <td>{p.district}</td>
              <td className="space-x-2">
                {!p.approved && (
                  <button onClick={() => approve(p.id)}>Approve</button>
                )}
                <button onClick={() => remove(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
