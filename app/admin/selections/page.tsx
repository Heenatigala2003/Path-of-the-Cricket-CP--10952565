'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface District {
  id: number;            
  name: string;
  date: string;             
  venue: string;
  quota: string;
  province: string;
  map_link: string;
  duration: string;
  ground_type: string;
  lat: number | null;
  lng: number | null;
  status: string;
  gender: 'boys' | 'girls';
}

export default function AdminSelections() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<Partial<District> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDistricts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/selections/districts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch districts');
      setDistricts(Array.isArray(data) ? data : data.districts || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-district-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'district_events' },
        (payload) => {
          console.log('Realtime change on district_events:', payload);
          fetchDistricts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'districts' },
        (payload) => {
          console.log('Realtime change on districts:', payload);
          fetchDistricts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this district?')) return;
    try {
      const res = await fetch(`/api/selections/districts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  
  const toApiDate = (localDateTime: string): string => {
    if (!localDateTime) return '';
    
    return new Date(localDateTime).toISOString();
  };

  const toLocalDateTime = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        name: editingDistrict.name,
        province: editingDistrict.province,
        gender: editingDistrict.gender,
        date: editingDistrict.date ? toApiDate(editingDistrict.date) : undefined,
        venue: editingDistrict.venue,
        quota: editingDistrict.quota || '',
        map_link: editingDistrict.map_link || '',
        duration: editingDistrict.duration || '',
        ground_type: editingDistrict.ground_type || '',
        lat: editingDistrict.lat === '' || editingDistrict.lat === null || editingDistrict.lat === undefined
          ? null
          : Number(editingDistrict.lat),
        lng: editingDistrict.lng === '' || editingDistrict.lng === null || editingDistrict.lng === undefined
          ? null
          : Number(editingDistrict.lng),
        status: editingDistrict.status || 'SCHEDULED',
      };


      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      console.log('Submitting payload:', payload);

      const method = editingDistrict.id ? 'PUT' : 'POST';
      const url = editingDistrict.id
        ? `/api/selections/districts/${editingDistrict.id}`
        : '/api/selections/districts';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log('Response:', responseData);

      if (!res.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to save');
      }

      setIsModalOpen(false);
      setEditingDistrict(null);
     
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };


  const openNewModal = () => {
    setEditingDistrict({
      gender: 'boys',
      status: 'SCHEDULED',
      quota: '10 Batters / 10 All-Rounders / 10 Ballers',
      duration: 'Full Day (9 AM - 5 PM)',
      name: '',
      province: '',
      venue: '',
      map_link: '',
      ground_type: '',
      lat: null,
      lng: null,
      date: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (district: District) => {
    const localDate = district.date ? toLocalDateTime(district.date) : '';
    setEditingDistrict({
      ...district,
      date: localDate,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setEditingDistrict(prev => {
      if (!prev) return prev;
      if (type === 'number') {
        return {
          ...prev,
          [name]: value === '' ? null : parseFloat(value),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Manage Districts</h1>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} /> Add District
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={fetchDistricts}
              className="mt-2 text-sm text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Province</th>
                  <th className="p-3 text-left">Gender</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Venue</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {districts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No districts found. Click "Add District" to create one.
                    </td>
                  </tr>
                ) : (
                  districts.map((d) => (
                    <tr key={d.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="p-3">{d.name}</td>
                      <td className="p-3">{d.province}</td>
                      <td className="p-3 capitalize">{d.gender}</td>
                      <td className="p-3">{new Date(d.date).toLocaleDateString()}</td>
                      <td className="p-3">{d.venue}</td>
                      <td className="p-3">{d.status}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openEditModal(d)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && editingDistrict && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {editingDistrict.id ? 'Edit District' : 'New District'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDistrict(null);
                  }}
                >
                  <X className="text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* form fields - same as before */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={editingDistrict.name || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Province *</label>
                    <input
                      type="text"
                      name="province"
                      required
                      value={editingDistrict.province || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Gender *</label>
                    <select
                      name="gender"
                      required
                      value={editingDistrict.gender || 'boys'}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    >
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="date"
                      required
                      value={editingDistrict.date || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Venue *</label>
                  <input
                    type="text"
                    name="venue"
                    required
                    value={editingDistrict.venue || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Quota</label>
                  <input
                    type="text"
                    name="quota"
                    value={editingDistrict.quota || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Map Link</label>
                  <input
                    type="url"
                    name="map_link"
                    value={editingDistrict.map_link || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={editingDistrict.duration || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Ground Type</label>
                  <input
                    type="text"
                    name="ground_type"
                    value={editingDistrict.ground_type || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Latitude</label>
                    <input
                      type="number"
                      name="lat"
                      step="any"
                      value={editingDistrict.lat ?? ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Longitude</label>
                    <input
                      type="number"
                      name="lng"
                      step="any"
                      value={editingDistrict.lng ?? ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    name="status"
                    value={editingDistrict.status || 'SCHEDULED'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="LIVE NOW">Live Now</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingDistrict(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : editingDistrict.id ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}