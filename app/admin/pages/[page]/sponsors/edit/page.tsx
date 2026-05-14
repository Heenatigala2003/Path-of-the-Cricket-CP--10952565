"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ArrowLeft, Save, Upload, X, 
  DollarSign, Globe, Mail, Phone
} from 'lucide-react';

export default function SponsorEditPage() {
  const [sponsor, setSponsor] = useState<any>({
    name: '',
    category: '',
    investment: '',
    contact: '',
    sponsorship_level: 'bronze',
    description: '',
    logo_url: '',
    website_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sponsorId = searchParams.get('id');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkAuth();
    if (sponsorId) {
      fetchSponsor();
    }
  }, [sponsorId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login?redirect=/admin/pages/sponsors/edit');
    }
  };

  const fetchSponsor = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', sponsorId)
        .single();

      if (error) throw error;
      if (data) {
        setSponsor(data);
      }
    } catch (error) {
      console.error('Error fetching sponsor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (sponsorId) {
        // Update existing sponsor
        const { error } = await supabase
          .from('sponsors')
          .update(sponsor)
          .eq('id', sponsorId);

        if (error) throw error;
        alert('Sponsor updated successfully!');
      } else {
        // Create new sponsor
        const { error } = await supabase
          .from('sponsors')
          .insert([sponsor]);

        if (error) throw error;
        alert('Sponsor created successfully!');
        router.push('/admin/dashboard');
      }
    } catch (error: any) {
      alert(error.message || 'Error saving sponsor');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sponsor-logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('sponsor-logos')
        .getPublicUrl(fileName);

      setSponsor({ ...sponsor, logo_url: data.publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: 'transparent',
      border: '1px solid #333',
      color: '#ffffff',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem'
    },
    title: {
      color: '#FFD700',
      fontSize: '2rem'
    },
    form: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      color: '#ffffff',
      marginBottom: '8px',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: '#2a2a2a',
      border: '1px solid #333',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      background: '#2a2a2a',
      border: '1px solid #333',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      background: '#2a2a2a',
      border: '1px solid #333',
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '1rem',
      minHeight: '120px',
      resize: 'vertical' as const
    },
    imageUpload: {
      border: '2px dashed #333',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center' as const,
      cursor: 'pointer'
    },
    imagePreview: {
      maxWidth: '200px',
      marginTop: '20px',
      borderRadius: '8px'
    },
    saveButton: {
      padding: '14px 30px',
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      color: '#000000',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    toggle: {
      width: '50px',
      height: '26px',
      background: sponsor.is_active ? '#4CAF50' : '#666',
      borderRadius: '13px',
      position: 'relative' as const,
      cursor: 'pointer'
    },
    toggleThumb: {
      width: '22px',
      height: '22px',
      background: '#ffffff',
      borderRadius: '11px',
      position: 'absolute' as const,
      top: '2px',
      left: sponsor.is_active ? '26px' : '2px',
      transition: 'left 0.3s'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          Loading sponsor details...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => router.push('/admin/dashboard')} style={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 style={styles.title}>
          {sponsorId ? 'Edit Sponsor' : 'Create New Sponsor'}
        </h1>
        <div></div> {/* Empty div for spacing */}
      </header>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Sponsor Name</label>
            <input
              type="text"
              style={styles.input}
              value={sponsor.name}
              onChange={(e) => setSponsor({...sponsor, name: e.target.value})}
              required
              placeholder="Enter sponsor name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <input
              type="text"
              style={styles.input}
              value={sponsor.category}
              onChange={(e) => setSponsor({...sponsor, category: e.target.value})}
              required
              placeholder="e.g., Sports Equipment, Nutrition"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Investment (USDT)</label>
            <input
              type="number"
              style={styles.input}
              value={sponsor.investment}
              onChange={(e) => setSponsor({...sponsor, investment: parseFloat(e.target.value)})}
              required
              placeholder="1000"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Sponsorship Level</label>
            <select
              style={styles.select}
              value={sponsor.sponsorship_level}
              onChange={(e) => setSponsor({...sponsor, sponsorship_level: e.target.value})}
            >
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="community">Community</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Email</label>
            <input
              type="email"
              style={styles.input}
              value={sponsor.contact}
              onChange={(e) => setSponsor({...sponsor, contact: e.target.value})}
              required
              placeholder="contact@example.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Website URL</label>
            <input
              type="url"
              style={styles.input}
              value={sponsor.website_url}
              onChange={(e) => setSponsor({...sponsor, website_url: e.target.value})}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            value={sponsor.description}
            onChange={(e) => setSponsor({...sponsor, description: e.target.value})}
            placeholder="Enter sponsor description..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Logo Upload</label>
          <div style={styles.imageUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="logo-upload"
            />
            <label htmlFor="logo-upload" style={{ cursor: 'pointer' }}>
              <Upload size={40} style={{ color: '#FFD700', marginBottom: '10px' }} />
              <div>Click to upload logo</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                PNG, JPG, SVG up to 5MB
              </div>
            </label>
            {sponsor.logo_url && (
              <div style={{ marginTop: '20px' }}>
                <img src={sponsor.logo_url} alt="Logo preview" style={styles.imagePreview} />
                <button
                  type="button"
                  onClick={() => setSponsor({...sponsor, logo_url: ''})}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '10px',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #ff6b6b',
                    color: '#ff6b6b',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                  Remove Logo
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <div style={styles.toggleContainer}>
            <div 
              style={styles.toggle}
              onClick={() => setSponsor({...sponsor, is_active: !sponsor.is_active})}
            >
              <div style={styles.toggleThumb} />
            </div>
            <span>{sponsor.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <button type="submit" style={styles.saveButton} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : sponsorId ? 'Update Sponsor' : 'Create Sponsor'}
        </button>
      </form>
    </div>
  );
}