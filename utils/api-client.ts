// utils/api-client.ts

async function apiCall(endpoint: string, options?: RequestInit) {
  const res = await fetch(`/api/player/${endpoint}`, options);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'API error');
  }
  return res.json();
}

export const apiClient = {
  checkPlayerExists: async (email: string) => {
    return apiCall('check-exists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  },

  checkDistrictCapacity: async (district: string, gender: string) => {
    return apiCall('check-capacity', {
      method: 'POST',
      body: JSON.stringify({ district, gender }),
    });
  },

  registerPlayer: async (data: any) => {
    return apiCall('register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPlayerProfile: async (email: string, gender?: string) => {
    const params = new URLSearchParams({ email });
    if (gender) params.append('gender', gender);
    return apiCall(`profile?${params}`);
  },

  updatePlayerProfile: async (playerId: string, gender: string, profileData: any) => {
    return apiCall('profile', {
      method: 'PUT',
      body: JSON.stringify({ playerId, gender, profileData }),
    });
  },
};