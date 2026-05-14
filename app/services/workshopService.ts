// @/services/workshopService.ts
import { createClient } from '@/lib/supabase/client';

export class WorkshopService {
  private supabase = createClient();

  async getWorkshopsByGender(gender: string) {
    const { data, error } = await this.supabase
      .from('provincial_workshops')
      .select(`
        *,
        workshop_sessions (*)
      `)
      .eq('gender', gender)
      .order('province');

    if (error) throw error;
    return data || [];
  }

  async completeSession(sessionId: string, workshopId: string) {
    const { error } = await this.supabase
      .from('workshop_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('workshop_id', workshopId);

    if (error) throw error;
  }
}