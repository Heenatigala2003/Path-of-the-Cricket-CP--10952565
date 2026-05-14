'use client';

import React, { useState, useEffect } from 'react';
import * as workshopService from '@/lib/supabase/workshopService';
import { staticData } from '@/lib/supabase/workshopService';
import type { Gender, Workshop } from '@/lib/supabase/types';

export default function AdminWorkshopsPage() {
  const [gender, setGender] = useState<Gender>('boys');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvince, setEditingProvince] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    coach_name: '',
    venue_name: '',
    location_lat: '',
    location_lng: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkshops();
  }, [gender]);

  async function fetchWorkshops() {
    setLoading(true);
    setError(null);
    try {
      // Get full workshop objects for all provinces of the selected gender
      const fullWorkshops = await Promise.all(
        staticData.provinceIds.map(async (provinceId) => {
          return workshopService.getWorkshop(provinceId, gender);
        })
      );
      setWorkshops(fullWorkshops);
    } catch (error) {
      console.error('Error fetching workshops', error);
      setError('Failed to load workshops. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(province: string) {
    setError(null);
    try {
     
      await workshopService.updateWorkshop(province, gender, {
        coach_name: editForm.coach_name,
        venue_name: editForm.venue_name,
        location_lat: parseFloat(editForm.location_lat),
        location_lng: parseFloat(editForm.location_lng),
      });
      setEditingProvince(null);
      await fetchWorkshops(); 
      alert('Workshop updated successfully!');
    } catch (error) {
      console.error('Update failed', error);
      setError('Update failed. Check console or ensure you have permission.');
    }
  }

  async function handleComplete(province: string) {
    setError(null);
    try {
      const result = await workshopService.completeSession(province, gender);
      if (result.lockStolen) {
        alert('Session was already completed by another admin. Please refresh.');
      } else if (result.success) {
        alert(`Session ${result.newCount} completed!`);
        await fetchWorkshops();
      } else {
        alert('Could not complete session (maybe already finished)');
      }
    } catch (error) {
      console.error('Complete session error', error);
      setError('Failed to complete session.');
    }
  }

  if (loading) return <div className="admin-container">Loading workshops...</div>;

  return (
    <div className="admin-container">
      <h1>Admin - Workshop Management</h1>
      {error && <div className="error-banner">{error}</div>}
      <div className="gender-tabs">
        <button
          onClick={() => setGender('boys')}
          className={gender === 'boys' ? 'active' : ''}
        >
          Boys
        </button>
        <button
          onClick={() => setGender('girls')}
          className={gender === 'girls' ? 'active' : ''}
        >
          Girls
        </button>
      </div>

      <div className="workshop-list">
        {staticData.provinceIds.map((provinceId) => {
          const workshop = workshops.find((w) => w.province === provinceId);
          const displayName = staticData.provinceDisplayNames[provinceId];
          const isEditing = editingProvince === provinceId;

          if (!workshop) {
            return (
              <div key={provinceId} className="workshop-card">
                <h3>{displayName}</h3>
                <p className="warning">No workshop record found. Please create one in Supabase.</p>
              </div>
            );
          }

          return (
            <div key={workshop.id} className="workshop-card">
              <h3>{displayName}</h3>
              {isEditing ? (
                <div className="edit-form">
                  <input
                    type="text"
                    placeholder="Coach Name"
                    value={editForm.coach_name}
                    onChange={(e) => setEditForm({ ...editForm, coach_name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Venue Name"
                    value={editForm.venue_name}
                    onChange={(e) => setEditForm({ ...editForm, venue_name: e.target.value })}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={editForm.location_lat}
                    onChange={(e) => setEditForm({ ...editForm, location_lat: e.target.value })}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={editForm.location_lng}
                    onChange={(e) => setEditForm({ ...editForm, location_lng: e.target.value })}
                  />
                  <button onClick={() => handleUpdate(provinceId)}>Save</button>
                  <button onClick={() => setEditingProvince(null)}>Cancel</button>
                </div>
              ) : (
                <div className="details">
                  <p><strong>Coach:</strong> {workshop.coach_name}</p>
                  <p><strong>Venue:</strong> {workshop.venue_name}</p>
                  <p><strong>Location:</strong> {workshop.location_lat}, {workshop.location_lng}</p>
                  <p><strong>Sessions Completed:</strong> {workshop.session_completed_count} / 24</p>
                  <p><strong>Version:</strong> {workshop.version}</p>
                  <div className="actions">
                    <button
                      onClick={() => {
                        setEditForm({
                          coach_name: workshop.coach_name,
                          venue_name: workshop.venue_name,
                          location_lat: workshop.location_lat.toString(),
                          location_lng: workshop.location_lng.toString(),
                        });
                        setEditingProvince(provinceId);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleComplete(provinceId)}>Complete Next Session</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .admin-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .gender-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .gender-tabs button {
          padding: 10px 20px;
          cursor: pointer;
        }
        .gender-tabs .active {
          background: #d1b042;
          color: black;
          font-weight: bold;
        }
        .workshop-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .workshop-card {
          border: 1px solid #444;
          padding: 20px;
          border-radius: 8px;
          background: #111;
          color: #eaf3fb;
        }
        .workshop-card h3 {
          color: #d1b042;
          margin-bottom: 10px;
        }
        .details p {
          margin: 5px 0;
        }
        .actions {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }
        .actions button {
          padding: 8px 16px;
          background: #d1b042;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .actions button:hover {
          background: #b38f2a;
        }
        .edit-form input {
          display: block;
          width: 100%;
          margin-bottom: 8px;
          padding: 8px;
          background: #222;
          color: white;
          border: 1px solid #555;
        }
        .warning {
          color: #ff6b6b;
        }
        .error-banner {
          background: #ff6b6b;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}