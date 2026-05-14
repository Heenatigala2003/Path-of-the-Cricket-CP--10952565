'use client'

import { useState, useEffect } from 'react'
import {
  playerApi,
  highlightsApi,
  talentsApi,
  uploadImage,
  type Player,
  type Highlight,
  type Talent
} from '@/utils/api'
import { Pencil, Trash2, Plus, X, Save, Loader2, Upload } from 'lucide-react'

type Tab = 'players' | 'highlights' | 'talents'

export default function AdminPortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('players')
  const [players, setPlayers] = useState<Player[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [playersData, highlightsData, talentsData] = await Promise.all([
        playerApi.searchPlayers(''),
        highlightsApi.getAllHighlights(),
        talentsApi.getAllTalents(),
      ])
      setPlayers(playersData)
      setHighlights(highlightsData)
      setTalents(talentsData)
    } catch (err) {
      setError('Failed to load data. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData(item)
    setIsCreating(false)
    setUploadError(null)
    setError(null)
  }

  const handleCreate = () => {
    setEditingItem(null)
    setFormData(getDefaultForm(activeTab))
    setIsCreating(true)
    setUploadError(null)
    setError(null)
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsCreating(false)
    setFormData({})
    setUploadError(null)
    setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    let bucket = ''
    let folder = ''
    if (activeTab === 'players') {
      bucket = 'player-images'
      folder = 'players'
    } else if (activeTab === 'highlights') {
      bucket = 'highlight-images'
      folder = 'highlights'
    } else {
      bucket = 'talent-images'
      folder = 'talents'
    }

    setUploading(true)
    setUploadError(null)
    try {
      const publicUrl = await uploadImage(file, bucket, folder)
      setFormData((prev: any) => ({ ...prev, image_url: publicUrl }))
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown upload error'
      setUploadError(`Upload failed: ${errorMessage}`)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleArrayChange = (index: number, field: 'label' | 'value', value: string) => {
    const stats = [...(formData.stats || [])]
    if (!stats[index]) stats[index] = { label: '', value: '' }
    stats[index][field] = value
    setFormData((prev: any) => ({ ...prev, stats }))
  }

  const addStat = () => {
    setFormData((prev: any) => ({
      ...prev,
      stats: [...(prev.stats || []), { label: '', value: '' }]
    }))
  }

  const removeStat = (index: number) => {
    const stats = [...(formData.stats || [])]
    stats.splice(index, 1)
    setFormData((prev: any) => ({ ...prev, stats }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (activeTab === 'players') {
        if (isCreating) {
          await playerApi.createPlayer(formData)
        } else {
          await playerApi.updatePlayer(editingItem.id, formData)
        }
      } else if (activeTab === 'highlights') {
        if (isCreating) {
          await highlightsApi.createHighlight(formData)
        } else {
          await highlightsApi.updateHighlight(editingItem.id, formData)
        }
      } else {
        if (isCreating) {
          await talentsApi.createTalent(formData)
        } else {
          await talentsApi.updateTalent(editingItem.id, formData)
        }
      }
      await fetchData()
      handleCancel()
    } catch (err: any) {
      
      const errorMessage = err?.message || 'Save failed. Please check your input.'
      setError(`Save failed: ${errorMessage}`)
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      if (activeTab === 'players') {
        await playerApi.deletePlayer(id)
      } else if (activeTab === 'highlights') {
        await highlightsApi.deleteHighlight(id)
      } else {
        await talentsApi.deleteTalent(id)
      }
      await fetchData()
    } catch (err: any) {
      const errorMessage = err?.message || 'Delete failed.'
      setError(`Delete failed: ${errorMessage}`)
      console.error('Delete error:', err)
    }
  }

  const getDefaultForm = (tab: Tab) => {
    if (tab === 'players') {
      return {
        name: '',
        gender: 'Boy',
        role: '',
        age: '',
        team: '',
        ranking: '',
        description: '',
        image_url: '',
        stats: []
      }
    } else if (tab === 'highlights') {
      return {
        title: '',
        description: '',
        year: new Date().getFullYear().toString(),
        image_url: '',
        video_url: ''
      }
    } else {
      return {
        name: '',
        role: '',
        bio: '',
        image_url: ''
      }
    }
  }

  const ImageUploadSection = () => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">Image</label>
      <div className="flex items-center gap-3">
        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload size={18} />
          {uploading ? 'Uploading...' : 'Choose Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {formData.image_url && (
          <span className="text-sm text-green-400 truncate max-w-[200px]">
            Image uploaded
          </span>
        )}
      </div>
      {uploadError && (
        <p className="text-xs text-red-400 mt-1 break-words">{uploadError}</p>
      )}
      {uploading && <p className="text-xs text-yellow-400 mt-1">Uploading...</p>}
      {!formData.image_url && !uploading && !uploadError && (
        <p className="text-xs text-gray-500 mt-1">No image selected</p>
      )}
    </div>
  )

  const renderForm = () => {
    const baseClasses = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"

    if (activeTab === 'players') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={baseClasses} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
              <select name="gender" value={formData.gender || 'Boy'} onChange={handleChange} className={baseClasses}>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
              <input type="text" name="role" value={formData.role || ''} onChange={handleChange} className={baseClasses} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
              <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className={baseClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Team</label>
              <input type="text" name="team" value={formData.team || ''} onChange={handleChange} className={baseClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ranking</label>
              <input type="text" name="ranking" value={formData.ranking || ''} onChange={handleChange} className={baseClasses} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className={baseClasses}></textarea>
          </div>

          <ImageUploadSection />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Stats (optional)</label>
            {formData.stats?.map((stat: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Label (e.g., Matches)"
                  value={stat.label}
                  onChange={(e) => handleArrayChange(idx, 'label', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 254)"
                  value={stat.value}
                  onChange={(e) => handleArrayChange(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
                <button type="button" onClick={() => removeStat(idx)} className="p-2 text-red-400 hover:text-red-300">
                  <X size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addStat} className="text-sm text-yellow-400 hover:text-yellow-300">
              + Add Stat
            </button>
          </div>
        </div>
      )
    } else if (activeTab === 'highlights') {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} required className={baseClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className={baseClasses}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Year *</label>
            <input type="text" name="year" value={formData.year || ''} onChange={handleChange} required className={baseClasses} />
          </div>

          <ImageUploadSection />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Video URL (YouTube)</label>
            <input type="url" name="video_url" value={formData.video_url || ''} onChange={handleChange} className={baseClasses} />
          </div>
        </div>
      )
    } else {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={baseClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role *</label>
            <input type="text" name="role" value={formData.role || ''} onChange={handleChange} required className={baseClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
            <textarea name="bio" rows={3} value={formData.bio || ''} onChange={handleChange} className={baseClasses}></textarea>
          </div>

          <ImageUploadSection />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">Admin Dashboard - Portfolio Management</h1>

        <div className="flex border-b border-gray-700 mb-6">
          {(['players', 'highlights', 'talents'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); handleCancel(); }}
              className={`px-6 py-3 font-medium uppercase tracking-wide transition ${
                activeTab === tab
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-yellow-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300 whitespace-pre-wrap break-words">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold capitalize">{activeTab} List</h2>
              <button
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Add New
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === 'players' && players.map(p => (
                  <div key={p.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full overflow-hidden">
                        {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-400">{p.role} • {p.gender}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-blue-400 hover:text-blue-300">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {activeTab === 'highlights' && highlights.map(h => (
                  <div key={h.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{h.title}</div>
                      <div className="text-sm text-gray-400">{h.year}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(h)} className="p-2 text-blue-400 hover:text-blue-300">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="p-2 text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {activeTab === 'talents' && talents.map(t => (
                  <div key={t.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-gray-400">{t.role}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(t)} className="p-2 text-blue-400 hover:text-blue-300">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {activeTab === 'players' && players.length === 0 && <p className="text-gray-500">No players yet.</p>}
                {activeTab === 'highlights' && highlights.length === 0 && <p className="text-gray-500">No highlights yet.</p>}
                {activeTab === 'talents' && talents.length === 0 && <p className="text-gray-500">No talents yet.</p>}
              </div>
            )}
          </div>

          {(isCreating || editingItem) && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">{isCreating ? 'Create New' : 'Edit'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderForm()}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}