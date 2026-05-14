import { createClient } from './supabase/client'


export type Player = {
  id: string
  name: string
  gender: 'Boy' | 'Girl'
  role?: string | null
  age?: number | null
  team?: string | null
  ranking?: string | null
  description?: string | null
  image_url?: string | null
  stats?: Array<{ label: string; value: string }> | null
}

export type Highlight = {
  id: string
  title: string
  description?: string | null
  year: string
  image_url?: string | null
  video_url?: string | null
}

export type Talent = {
  id: string
  name: string
  role: string
  bio?: string | null
  image_url?: string | null
}


export const mockAllPlayers: Player[] = [
  {
    id: '1',
    name: 'Virat Kohli',
    gender: 'Boy',
    role: 'Batsman',
    age: 35,
    team: 'India',
    ranking: '1',
    description: 'One of the best batsmen in the world.',
    image_url: '/images/players/virat.jpg',
    stats: [
      { label: 'Matches', value: '254' },
      { label: 'Runs', value: '12,898' },
      { label: 'Avg', value: '57.32' },
    ],
  },
  {
    id: '2',
    name: 'Smriti Mandhana',
    gender: 'Girl',
    role: 'Batsman',
    age: 27,
    team: 'India Women',
    ranking: '2',
    description: 'Left-handed opening batter.',
    image_url: '/images/players/smriti.jpg',
    stats: [
      { label: 'Matches', value: '78' },
      { label: 'Runs', value: '2,834' },
      { label: 'Avg', value: '41.68' },
    ],
  },
  {
    id: '3',
    name: 'Jasprit Bumrah',
    gender: 'Boy',
    role: 'Bowler',
    age: 30,
    team: 'India',
    ranking: '1',
    description: 'Premier fast bowler.',
    image_url: '/images/players/bumrah.jpg',
    stats: [
      { label: 'Matches', value: '89' },
      { label: 'Wickets', value: '124' },
      { label: 'Econ', value: '4.63' },
    ],
  },
  {
    id: '4',
    name: 'Harmanpreet Kaur',
    gender: 'Girl',
    role: 'All-rounder',
    age: 34,
    team: 'India Women',
    ranking: '3',
    description: 'Captain of Indian women’s team.',
    image_url: '/images/players/harman.jpg',
    stats: [
      { label: 'Matches', value: '125' },
      { label: 'Runs', value: '2,836' },
      { label: 'Wickets', value: '32' },
    ],
  },
  {
    id: '5',
    name: 'Rishabh Pant',
    gender: 'Boy',
    role: 'Wicket-keeper',
    age: 26,
    team: 'India',
    ranking: '4',
    description: 'Aggressive left-handed batsman.',
    image_url: '/images/players/pant.jpg',
    stats: [
      { label: 'Matches', value: '33' },
      { label: 'Runs', value: '1,141' },
      { label: 'Catches', value: '42' },
    ],
  },
  {
    id: '6',
    name: 'Mithali Raj',
    gender: 'Girl',
    role: 'Batsman',
    age: 41,
    team: 'India Women',
    ranking: '5',
    description: 'Legendary cricketer.',
    image_url: '/images/players/mithali.jpg',
    stats: [
      { label: 'Matches', value: '232' },
      { label: 'Runs', value: '7,805' },
      { label: 'Avg', value: '50.68' },
    ],
  },
]

export const mockFeaturedBoys: Player[] = mockAllPlayers.filter(p => p.gender === 'Boy').slice(0, 3)
export const mockFeaturedGirls: Player[] = mockAllPlayers.filter(p => p.gender === 'Girl').slice(0, 3)

export const mockHighlights: Highlight[] = [
  {
    id: '1',
    title: 'India vs Australia Final 2023',
    description: 'Highlights of the thrilling final match.',
    year: '2023',
    image_url: '/images/highlights/ind-aus.jpg',
    video_url: 'https://www.youtube.com/watch?v=example1',
  },
  {
    id: '2',
    title: 'IPL 2024: MI vs CSK',
    description: 'Last over finish.',
    year: '2024',
    image_url: '/images/highlights/ipl.jpg',
    video_url: 'https://www.youtube.com/watch?v=example2',
  },
  {
    id: '3',
    title: 'Women’s T20 World Cup Semi',
    description: 'Best moments from the semi-final.',
    year: '2023',
    image_url: '/images/highlights/womens-t20.jpg',
    video_url: 'https://www.youtube.com/watch?v=example3',
  },
]

export const mockTalents: Talent[] = [
  {
    id: '1',
    name: 'Yashasvi Jaiswal',
    role: 'Batsman',
    bio: 'Young left-hander with immense potential.',
    image_url: '/images/talents/jaiswal.jpg',
  },
  {
    id: '2',
    name: 'Shafali Verma',
    role: 'Batsman',
    bio: 'Explosive opener.',
    image_url: '/images/talents/shafali.jpg',
  },
  {
    id: '3',
    name: 'Umran Malik',
    role: 'Bowler',
    bio: 'Fastest bowler in domestic circuit.',
    image_url: '/images/talents/umran.jpg',
  },
  {
    id: '4',
    name: 'Richa Ghosh',
    role: 'Wicket-keeper',
    bio: 'Power-hitter.',
    image_url: '/images/talents/richa.jpg',
  },
  {
    id: '5',
    name: 'Tilak Varma',
    role: 'Batsman',
    bio: 'Stylish middle-order batsman.',
    image_url: '/images/talents/tilak.jpg',
  },
  {
    id: '6',
    name: 'Deepti Sharma',
    role: 'All-rounder',
    bio: 'Consistent performer.',
    image_url: '/images/talents/deepti.jpg',
  },
  {
    id: '7',
    name: 'Arshdeep Singh',
    role: 'Bowler',
    bio: 'Left-arm swing bowler.',
    image_url: '/images/talents/arshdeep.jpg',
  },
  {
    id: '8',
    name: 'Jemimah Rodrigues',
    role: 'Batsman',
    bio: 'Technically sound batter.',
    image_url: '/images/talents/jemimah.jpg',
  },
]



let supabase
try {
  supabase = createClient()
} catch (e) {
  console.error('Failed to create Supabase client:', e)

}


export async function uploadImage(
  file: File,
  bucket: string,
  folder?: string
): Promise<string> {
  try {
    const client = createClient() 
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder ? folder + '/' : ''}${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`

    console.log('Uploading to bucket:', bucket, 'fileName:', fileName) 

    const { error } = await client.storage.from(bucket).upload(fileName, file)
    if (error) {
      console.error('Supabase upload error:', error)
      throw error
    }

    const { data } = client.storage.from(bucket).getPublicUrl(fileName)
    console.log('Public URL:', data.publicUrl) 
    return data.publicUrl
  } catch (err) {
    console.error('Upload failed:', err)
    throw err 
  }
}


export async function getPlayers(): Promise<Player[]> {
  try {
    if (!supabase) throw new Error('Supabase client not available')
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('getPlayers failed, using mock data:', err)
    return mockAllPlayers
  }
}

export const playerApi = {
  getFeaturedPlayers: async (gender: 'Boy' | 'Girl', limit = 3): Promise<Player[]> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('gender', gender)
        .order('ranking', { ascending: true })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      console.warn(`getFeaturedPlayers(${gender}) failed, using mock data:`, err)
      return mockAllPlayers.filter(p => p.gender === gender).slice(0, limit)
    }
  },

  searchPlayers: async (query: string): Promise<Player[]> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or(
          `name.ilike.%${query}%,role.ilike.%${query}%,team.ilike.%${query}%,description.ilike.%${query}%`
        )
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.warn('searchPlayers failed, using mock data:', err)
      const lowerQuery = query.toLowerCase()
      return mockAllPlayers.filter(
        p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.role?.toLowerCase().includes(lowerQuery) ||
          p.team?.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery)
      )
    }
  },

  getPlayerById: async (id: string): Promise<Player | null> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.warn(`getPlayerById(${id}) failed, searching mock data:`, err)
      const mockPlayer = mockAllPlayers.find(p => p.id === id)
      return mockPlayer || null
    }
  },

  
  createPlayer: async (player: Omit<Player, 'id'>): Promise<Player> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('players')
        .insert(player)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('createPlayer failed:', err)
      throw err
    }
  },

  updatePlayer: async (id: string, updates: Partial<Player>): Promise<Player> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('updatePlayer failed:', err)
      throw err
    }
  },

  deletePlayer: async (id: string): Promise<void> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { error } = await supabase.from('players').delete().eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('deletePlayer failed:', err)
      throw err
    }
  },
}



export const highlightsApi = {
  getAllHighlights: async (): Promise<Highlight[]> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('year', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.warn('getAllHighlights failed, using mock data:', err)
      return mockHighlights
    }
  },

  createHighlight: async (highlight: Omit<Highlight, 'id'>): Promise<Highlight> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('highlights')
        .insert(highlight)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('createHighlight failed:', err)
      throw err
    }
  },

  updateHighlight: async (id: string, updates: Partial<Highlight>): Promise<Highlight> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('highlights')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('updateHighlight failed:', err)
      throw err
    }
  },

  deleteHighlight: async (id: string): Promise<void> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { error } = await supabase.from('highlights').delete().eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('deleteHighlight failed:', err)
      throw err
    }
  },
}



export const talentsApi = {
  getAllTalents: async (limit?: number): Promise<Talent[]> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      let query = supabase.from('talents').select('*').order('name', { ascending: true })
      if (limit) query = query.limit(limit)
      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (err) {
      console.warn('getAllTalents failed, using mock data:', err)
      return limit ? mockTalents.slice(0, limit) : mockTalents
    }
  },

  createTalent: async (talent: Omit<Talent, 'id'>): Promise<Talent> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('talents')
        .insert(talent)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('createTalent failed:', err)
      throw err
    }
  },

  updateTalent: async (id: string, updates: Partial<Talent>): Promise<Talent> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { data, error } = await supabase
        .from('talents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('updateTalent failed:', err)
      throw err
    }
  },

  deleteTalent: async (id: string): Promise<void> => {
    try {
      if (!supabase) throw new Error('Supabase client not available')
      const { error } = await supabase.from('talents').delete().eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('deleteTalent failed:', err)
      throw err
    }
  },
}