
import { createClient, SupabaseClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


const safeStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,

        
          storage: safeStorage,

  
          storageKey: 'cricket-app-auth-v1',

          flowType: 'pkce'
        },

        global: {
          fetch: async (url, options = {}) => {
            try {
              return await fetch(url, options);
            } catch (err) {
              console.error('Fetch error:', err);
              throw err;
            }
          }
        }
      }
    );
  }

  return supabaseInstance;
}


export const supabase = getSupabaseClient();


export interface PlayerProfileData {
  batting_points?: number;
  bowling_points?: number;
  annual_rank?: number;
  height?: number;
  weight?: number;
  school?: string;
  date_of_birth?: string;
  preferred_format?: string;
  avatar_url?: string;
  matches?: number;
  runs?: number;
  wickets?: number;
  best_bowling?: string;
  batting_strike_rate?: number;
  bowling_economy?: number;
  highest_score?: number;
  fifties?: number;
  hundreds?: number;
}


export const supabaseClient = {


  async getSession() {
    try {
      const { data: { session } } =
        await supabase.auth.getSession();

      return session;
    } catch (error) {
      console.error('Session error:', error);
      return null;
    }
  },

 
  async signOut() {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) throw error;

    } catch (error) {
      console.error('SignOut error:', error);
    }
  },

 
  db: supabase,

  async checkPlayerExists(email: string) {
    const { data, error } =
      await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) throw error;

    return data;
  },

  async checkDistrictCapacity(
    district: string,
    gender: 'male' | 'female'
  ) {

    const { count, error } =
      await supabase
        .from('district_selections')
        .select('*',
          { count: 'exact', head: true }
        )
        .eq('district', district)
        .eq('gender', gender)
        .eq('status', 'REGISTERED');

    if (error) throw error;

    const max = 30;

    return {
      count: count || 0,
      max,
      available: (count || 0) < max
    };
  },

  async registerPlayer(playerData: {
    full_name: string;
    email: string;
    district: string;
    primary_role: string;
    gender: 'male' | 'female';
  }) {

    const {
      data: player,
      error: playerError
    } =
      await supabase
        .from('players')
        .insert({
          full_name:
            playerData.full_name,
          email:
            playerData.email,
          district:
            playerData.district,
          primary_role:
            playerData.primary_role,
          gender:
            playerData.gender,
        })
        .select()
        .single();

    if (playerError)
      throw playerError;

    await supabase
      .from('district_selections')
      .insert({
        player_id: player.id,
        district:
          playerData.district,
        gender:
          playerData.gender,
        status:
          'REGISTERED',
        registered_at:
          new Date().toISOString(),
      });

    await supabase
      .from('profiles')
      .insert({
        id: player.id,
        batting_points: 0,
        bowling_points: 0
      });

    return player;
  },

  async getPlayerProfile(
    email: string,
    gender?: 'male' | 'female'
  ) {

    let query =
      supabase
        .from('players')
        .select('*')
        .eq('email', email);

    if (gender)
      query =
        query.eq('gender', gender);

    const {
      data: player,
      error: playerError
    } =
      await query.maybeSingle();

    if (playerError || !player)
      return null;

    const [
      selection,
      annual,
      profile
    ] =
      await Promise.all([

        supabase
          .from('district_selections')
          .select('*')
          .eq('player_id', player.id)
          .maybeSingle(),

        supabase
          .from('annual_selections')
          .select('*')
          .eq('player_id', player.id)
          .eq(
            'year',
            new Date().getFullYear()
          )
          .maybeSingle(),

        supabase
          .from('profiles')
          .select('*')
          .eq('id', player.id)
          .maybeSingle()

      ]);

    return {
      player,
      selection:
        selection.data,
      annual:
        annual.data,
      profile:
        profile.data
    };
  },

  async updatePlayerProfile(
    playerId: string,
    gender: 'male' | 'female',
    profileData: PlayerProfileData
  ) {

    const { error } =
      await supabase
        .from('profiles')
        .upsert({
          id: playerId,
          ...profileData,
          updated_at:
            new Date().toISOString(),
        });

    if (error)
      throw error;

    return true;
  },

  async uploadFileToStorage(
    file: File,
    bucket = 'gallery',
    userId?: string
  ) {

    const timestamp =
      Date.now();

    const safeFileName =
      file.name.replace(
        /[^a-zA-Z0-9.]/g,
        '_'
      );

    const path =
      userId
        ? `${userId}/${timestamp}-${safeFileName}`
        : `${timestamp}-${safeFileName}`;

    const {
      data,
      error
    } =
      await supabase
        .storage
        .from(bucket)
        .upload(
          path,
          file,
          {
            cacheControl: '3600',
            upsert: false
          }
        );

    if (error)
      throw error;

    const {
      data: urlData
    } =
      supabase
        .storage
        .from(bucket)
        .getPublicUrl(
          data.path
        );

    return {
      url:
        urlData.publicUrl,
      path:
        data.path
    };
  }

};