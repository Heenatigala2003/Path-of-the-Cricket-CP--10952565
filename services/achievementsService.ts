import { supabase } from '@/lib/supabase/client';   

export interface IndividualChampion {
  id: number;
  name: string;
  role: string;
  image_url: string | null;
  career_runs?: string | null;
  player_of_the_year?: string | null;
  highest_score?: string | null;
  career_wickets?: string | null;
  best_bowling_figure?: string | null;
  hat_tricks?: string | null;
  career_runs_wickets?: string | null;
  tournament_mvp?: string | null;
  fastest_century?: string | null;
}

export interface TeamAchievement {
  id: number;
  title: string;
  year: string;
  icon: string;
}

export interface KeyAchievement {
  id: number;
  text: string;
  highlight: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export async function getIndividualChampions(): Promise<IndividualChampion[]> {
  const { data, error } = await supabase
    .from('individual_champions')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function getTeamAchievements(): Promise<TeamAchievement[]> {
  const { data, error } = await supabase
    .from('team_achievements')
    .select('*')
    .order('year', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getKeyAchievement(): Promise<KeyAchievement | null> {
  const { data, error } = await supabase
    .from('key_achievement')
    .select('*')
    .limit(1)
    .maybeSingle(); 
  if (error) throw error;
  return data;
}

export async function getSubscriberCount(): Promise<number> {
  const { count, error } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count || 0;
}


export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, subscribed_at: new Date().toISOString() }]);
    if (error) {
      if (error.code === '23505') {
        return { success: false, message: 'Email already subscribed!' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully subscribed!' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function submitContactForm(message: ContactMessage): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert([{ ...message, created_at: new Date().toISOString() }]);
    if (error) throw error;
    return { success: true, message: 'Message sent successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function addIndividualChampion(champion: Omit<IndividualChampion, 'id'>): Promise<IndividualChampion> {
  const { data, error } = await supabase
    .from('individual_champions')
    .insert([champion])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateIndividualChampion(id: number, updates: Partial<IndividualChampion>): Promise<IndividualChampion> {
  const { data, error } = await supabase
    .from('individual_champions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIndividualChampion(id: number): Promise<void> {
  const { error } = await supabase
    .from('individual_champions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}


export async function addTeamAchievement(achievement: Omit<TeamAchievement, 'id'>): Promise<TeamAchievement> {
  const { data, error } = await supabase
    .from('team_achievements')
    .insert([achievement])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeamAchievement(id: number, updates: Partial<TeamAchievement>): Promise<TeamAchievement> {
  const { data, error } = await supabase
    .from('team_achievements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeamAchievement(id: number): Promise<void> {
  const { error } = await supabase
    .from('team_achievements')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateKeyAchievement(id: number, updates: Partial<KeyAchievement>): Promise<KeyAchievement> {
  const { data, error } = await supabase
    .from('key_achievement')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadChampionImage(file: File, oldPath?: string | null): Promise<string> {
 
  if (oldPath) {
    try {
      const oldFileName = oldPath.split('/').pop();
      if (oldFileName) {
        await supabase.storage.from('champion-images').remove([oldFileName]);
      }
    } catch (deleteErr) {
      console.warn("Failed to delete old image:", deleteErr);
      
    }
  }

  const fileName = `${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('champion-images')
    .upload(fileName, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('champion-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export function subscribeToChampions(callback: (champions: IndividualChampion[]) => void) {
  const channel = supabase
    .channel('individual_champions_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'individual_champions' },
      async () => {
        const champions = await getIndividualChampions();
        callback(champions);
      }
    )
    .subscribe();
  return channel;
}

export function subscribeToTeamAchievements(callback: (teams: TeamAchievement[]) => void) {
  const channel = supabase
    .channel('team_achievements_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'team_achievements' },
      async () => {
        const teams = await getTeamAchievements();
        callback(teams);
      }
    )
    .subscribe();
  return channel;
}

export function subscribeToKeyAchievement(callback: (key: KeyAchievement | null) => void) {
  const channel = supabase
    .channel('key_achievement_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'key_achievement' },
      async () => {
        const key = await getKeyAchievement();
        callback(key);
      }
    )
    .subscribe();
  return channel;
}