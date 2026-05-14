"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getIndividualChampions,
  getTeamAchievements,
  getKeyAchievement,
  addIndividualChampion,
  updateIndividualChampion,
  deleteIndividualChampion,
  addTeamAchievement,
  updateTeamAchievement,
  deleteTeamAchievement,
  updateKeyAchievement,
  uploadChampionImage,
  type IndividualChampion,
  type TeamAchievement,
  type KeyAchievement,
} from "../../../services/achievementsService";
import { supabase } from "../../../lib/supabase/client";   // ✅ corrected import

export default function AdminAchievementsPage() {
  // ---------- State ----------
  const [champions, setChampions] = useState<IndividualChampion[]>([]);
  const [teamAchievements, setTeamAchievements] = useState<TeamAchievement[]>([]);
  const [keyAchievement, setKeyAchievement] = useState<KeyAchievement | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingChampion, setEditingChampion] = useState<Partial<IndividualChampion> | null>(null);
  const [editingTeam, setEditingTeam] = useState<Partial<TeamAchievement> | null>(null);
  const [editingKey, setEditingKey] = useState<Partial<KeyAchievement> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ---------- Fetch data ----------
  const fetchData = async () => {
    setLoading(true);
    try {
      const [champs, teams, key] = await Promise.all([
        getIndividualChampions(),
        getTeamAchievements(),
        getKeyAchievement(),
      ]);
      setChampions(champs);
      setTeamAchievements(teams);
      setKeyAchievement(key);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Champion Handlers ----------
  const handleChampionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChampion) return;

    if (!editingChampion.name?.trim() || !editingChampion.role?.trim()) {
      alert("Name and Role are required.");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = editingChampion.image_url;
      if (imageFile) {
        imageUrl = await uploadChampionImage(imageFile, editingChampion.image_url);
      }

      const championData = {
        name: editingChampion.name.trim(),
        role: editingChampion.role.trim(),
        image_url: imageUrl || null,
        career_runs: editingChampion.career_runs?.trim() || null,
        player_of_the_year: editingChampion.player_of_the_year?.trim() || null,
        highest_score: editingChampion.highest_score?.trim() || null,
        career_wickets: editingChampion.career_wickets?.trim() || null,
        best_bowling_figure: editingChampion.best_bowling_figure?.trim() || null,
        hat_tricks: editingChampion.hat_tricks?.trim() || null,
        career_runs_wickets: editingChampion.career_runs_wickets?.trim() || null,
        tournament_mvp: editingChampion.tournament_mvp?.trim() || null,
        fastest_century: editingChampion.fastest_century?.trim() || null,
      };

      if (editingChampion.id) {
        await updateIndividualChampion(editingChampion.id, championData);
        alert("Champion updated successfully!");
      } else {
        await addIndividualChampion(championData);
        alert("Champion added successfully!");
      }
      setEditingChampion(null);
      setImageFile(null);
      fetchData();
    } catch (error: any) {
      console.error("Error saving champion:", error);
      alert(`Failed to save champion: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteChampion = async (id: string, imageUrl?: string | null) => {
    if (!confirm("Are you sure you want to delete this champion?")) return;
    try {
      // Delete image from storage if exists
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('champion-images').remove([fileName]);
        }
      }
      await deleteIndividualChampion(id);
      alert("Champion deleted successfully!");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting champion:", error);
      alert(`Failed to delete champion: ${error.message}`);
    }
  };

  // ---------- Team Achievement Handlers ----------
  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    if (!editingTeam.title?.trim() || !editingTeam.year?.trim()) {
      alert("Title and Year are required.");
      return;
    }

    try {
      const teamData = {
        title: editingTeam.title.trim(),
        year: editingTeam.year.trim(),
        icon: editingTeam.icon?.trim() || "emoji_events",
      };

      if (editingTeam.id) {
        await updateTeamAchievement(editingTeam.id, teamData);
        alert("Team achievement updated!");
      } else {
        await addTeamAchievement(teamData);
        alert("Team achievement added!");
      }
      setEditingTeam(null);
      fetchData();
    } catch (error: any) {
      console.error("Error saving team achievement:", error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team achievement?")) return;
    try {
      await deleteTeamAchievement(id);
      alert("Team achievement deleted!");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting team achievement:", error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  // ---------- Key Achievement Handler ----------
  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey || !keyAchievement?.id) return;

    if (!editingKey.text?.trim() || !editingKey.highlight?.trim()) {
      alert("Text and highlight are required.");
      return;
    }

    try {
      await updateKeyAchievement(keyAchievement.id, {
        text: editingKey.text.trim(),
        highlight: editingKey.highlight.trim(),
      });
      alert("Key achievement updated!");
      setEditingKey(null);
      fetchData();
    } catch (error: any) {
      console.error("Error updating key achievement:", error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0f14", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ border: "4px solid rgba(255,255,255,0.1)", borderLeftColor: "#d1b042", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
          <p>Loading admin panel...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", color: "#e0e0e0", background: "#0a0f14", minHeight: "100vh" }}>
      <h1 style={{ color: "#d1b042", fontSize: "2.5rem", marginBottom: "2rem" }}>Admin - Manage Achievements</h1>

      {/* ===== Individual Champions ===== */}
      <section style={{ marginBottom: "4rem", background: "#111", padding: "1.5rem", borderRadius: "12px" }}>
        <h2 style={{ borderBottom: "2px solid #d1b042", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>Individual Champions</h2>
        <button
          onClick={() => setEditingChampion({})}
          style={{ marginBottom: "1.5rem", padding: "0.5rem 1.5rem", background: "#d1b042", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", color: "#000" }}
        >
          + Add New Champion
        </button>

        {/* Champion Form */}
        {editingChampion && (
          <form onSubmit={handleChampionSubmit} style={{ background: "#1a1a1a", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #333" }}>
            <h3 style={{ color: "#ffd700", marginBottom: "1rem" }}>{editingChampion.id ? "Edit Champion" : "New Champion"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", alignItems: "center" }}>
              <label>Name *</label>
              <input type="text" value={editingChampion.name || ""} onChange={(e) => setEditingChampion({ ...editingChampion, name: e.target.value })} required style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Role *</label>
              <input type="text" value={editingChampion.role || ""} onChange={(e) => setEditingChampion({ ...editingChampion, role: e.target.value })} required style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Image</label>
              <div>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} style={{ color: "#fff" }} />
                {editingChampion.image_url && !imageFile && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <Image src={editingChampion.image_url} alt="Current" width={80} height={80} style={{ objectFit: "cover", borderRadius: "4px" }} />
                  </div>
                )}
              </div>

              <label>Career Runs</label>
              <input type="text" value={editingChampion.career_runs || ""} onChange={(e) => setEditingChampion({ ...editingChampion, career_runs: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Player of the Year</label>
              <input type="text" value={editingChampion.player_of_the_year || ""} onChange={(e) => setEditingChampion({ ...editingChampion, player_of_the_year: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Highest Score</label>
              <input type="text" value={editingChampion.highest_score || ""} onChange={(e) => setEditingChampion({ ...editingChampion, highest_score: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Career Wickets</label>
              <input type="text" value={editingChampion.career_wickets || ""} onChange={(e) => setEditingChampion({ ...editingChampion, career_wickets: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Best Bowling Figure</label>
              <input type="text" value={editingChampion.best_bowling_figure || ""} onChange={(e) => setEditingChampion({ ...editingChampion, best_bowling_figure: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Hat-tricks</label>
              <input type="text" value={editingChampion.hat_tricks || ""} onChange={(e) => setEditingChampion({ ...editingChampion, hat_tricks: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Career Runs/Wickets</label>
              <input type="text" value={editingChampion.career_runs_wickets || ""} onChange={(e) => setEditingChampion({ ...editingChampion, career_runs_wickets: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Tournament MVP</label>
              <input type="text" value={editingChampion.tournament_mvp || ""} onChange={(e) => setEditingChampion({ ...editingChampion, tournament_mvp: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Fastest Century</label>
              <input type="text" value={editingChampion.fastest_century || ""} onChange={(e) => setEditingChampion({ ...editingChampion, fastest_century: e.target.value })} style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={uploading} style={{ background: "#53e51a", color: "#000", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                {uploading ? "Uploading..." : "Save Champion"}
              </button>
              <button type="button" onClick={() => { setEditingChampion(null); setImageFile(null); }} style={{ background: "#888", color: "#fff", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Champions List */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {champions.map((c) => (
            <div key={c.id} style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #333" }}>
              <Image src={c.image_url || "/placeholder.png"} alt={c.name} width={150} height={150} style={{ objectFit: "cover", borderRadius: "6px", width: "100%", height: "150px" }} />
              <h3 style={{ color: "#ffd700", margin: "0.5rem 0 0.2rem" }}>{c.name}</h3>
              <p style={{ color: "#53e51a", fontSize: "0.9rem" }}>{c.role}</p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={() => setEditingChampion(c)} style={{ background: "#d1b042", border: "none", padding: "0.3rem 1rem", borderRadius: "4px", cursor: "pointer", color: "#000" }}>Edit</button>
                <button onClick={() => handleDeleteChampion(c.id, c.image_url)} style={{ background: "#b33", border: "none", padding: "0.3rem 1rem", borderRadius: "4px", color: "#fff", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Team Achievements ===== */}
      <section style={{ marginBottom: "4rem", background: "#111", padding: "1.5rem", borderRadius: "12px" }}>
        <h2 style={{ borderBottom: "2px solid #d1b042", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>Team Achievements</h2>
        <button onClick={() => setEditingTeam({})} style={{ marginBottom: "1.5rem", padding: "0.5rem 1.5rem", background: "#d1b042", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", color: "#000" }}>
          + Add New Team Achievement
        </button>

        {editingTeam && (
          <form onSubmit={handleTeamSubmit} style={{ background: "#1a1a1a", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #333" }}>
            <h3 style={{ color: "#ffd700", marginBottom: "1rem" }}>{editingTeam.id ? "Edit Team Achievement" : "New Team Achievement"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", alignItems: "center" }}>
              <label>Title *</label>
              <input type="text" value={editingTeam.title || ""} onChange={(e) => setEditingTeam({ ...editingTeam, title: e.target.value })} required style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Year *</label>
              <input type="text" value={editingTeam.year || ""} onChange={(e) => setEditingTeam({ ...editingTeam, year: e.target.value })} required style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Icon (Material Icon name)</label>
              <input type="text" value={editingTeam.icon || ""} onChange={(e) => setEditingTeam({ ...editingTeam, icon: e.target.value })} placeholder="emoji_events" style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <button type="submit" style={{ background: "#53e51a", color: "#000", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Save</button>
              <button type="button" onClick={() => setEditingTeam(null)} style={{ background: "#888", color: "#fff", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {teamAchievements.map((t) => (
            <div key={t.id} style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #333", textAlign: "center" }}>
              <span className="material-icons" style={{ fontSize: "2.5rem", color: "#d1b042" }}>{t.icon}</span>
              <h4 style={{ color: "#fff", margin: "0.5rem 0 0.2rem" }}>{t.title}</h4>
              <p style={{ color: "#53e51a" }}>{t.year}</p>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
                <button onClick={() => setEditingTeam(t)} style={{ background: "#d1b042", border: "none", padding: "0.3rem 1rem", borderRadius: "4px", cursor: "pointer", color: "#000" }}>Edit</button>
                <button onClick={() => handleDeleteTeam(t.id)} style={{ background: "#b33", border: "none", padding: "0.3rem 1rem", borderRadius: "4px", color: "#fff", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Key Achievement ===== */}
      <section style={{ marginBottom: "4rem", background: "#111", padding: "1.5rem", borderRadius: "12px" }}>
        <h2 style={{ borderBottom: "2px solid #d1b042", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>Key Achievement (Banner)</h2>
        {keyAchievement ? (
          <div style={{ background: "#1a1a1a", padding: "1rem", borderRadius: "8px", border: "1px solid #333" }}>
            <p><strong>Text:</strong> {keyAchievement.text}</p>
            <p><strong>Highlight words:</strong> {keyAchievement.highlight}</p>
            <button onClick={() => setEditingKey(keyAchievement)} style={{ marginTop: "1rem", background: "#d1b042", border: "none", padding: "0.3rem 1.5rem", borderRadius: "4px", cursor: "pointer", color: "#000" }}>Edit</button>
          </div>
        ) : (
          <p>No key achievement set.</p>
        )}

        {editingKey && (
          <form onSubmit={handleKeySubmit} style={{ background: "#1a1a1a", padding: "1.5rem", borderRadius: "8px", marginTop: "1.5rem", border: "1px solid #333" }}>
            <h3 style={{ color: "#ffd700", marginBottom: "1rem" }}>Edit Key Achievement</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <label>Text *</label>
              <textarea value={editingKey.text || ""} onChange={(e) => setEditingKey({ ...editingKey, text: e.target.value })} rows={3} required style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />

              <label>Highlight words (comma separated)</label>
              <input type="text" value={editingKey.highlight || ""} onChange={(e) => setEditingKey({ ...editingKey, highlight: e.target.value })} placeholder="e.g. Champions, Victory, Record" style={{ padding: "0.5rem", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px" }} />
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              <button type="submit" style={{ background: "#53e51a", color: "#000", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Update</button>
              <button type="button" onClick={() => setEditingKey(null)} style={{ background: "#888", color: "#fff", padding: "0.5rem 1.5rem", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}