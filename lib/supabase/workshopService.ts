import { supabase } from '@/lib/supabase/client';
import type { Workshop, Gender, Statistics, Session } from '../types';


const sessionTopics = {
  boys: [
    "Advanced T20 Batting Tactics & Fast Bowling Biomechanics",
    "Specialist Fielding Drills: Slip Catching & Inner Circle Agility",
    "Mental Conditioning, Pressure Management, & Captaincy Skills",
    "Spin Bowling Variations & Middle-Order Accumulation Strategy",
    "Death Over Hitting Techniques & Wicket Keeping Drills",
    "Pitch Analysis & Swing/Seam Bowling Fundamentals",
    "Endurance Training & Opening Partnership Strategy",
    "Reverse Swing Mastery & Mid-Innings Run Rate Management",
    "Power Hitting and All-Rounder Skill Integration",
    "Test Match Simulation: Building a Long Innings",
    "Advanced S&C: Explosive Power Training",
    "Video Analysis & Technical Error Correction",
  ],
  girls: [
    "Technical Batting Foundations & Core Strength Training",
    "Wicket Keeping Fundamentals & Outfield Throwing Accuracy",
    "Sports Psychology: Focus, Confidence, and Team Building",
    "Slow Bowling Discipline & Defensive Batting Strategy",
    "Limited Overs Power Play Tactics & Agility Drills",
    "Seam and Swing Introduction & Safe Landing Mechanics",
    "Interval Training for Stamina & Running Between Wickets",
    "Building an Innings Structure & Field Placement Strategy",
    "Skill Integration Drills for All-Rounders",
    "Adaptation to Different Pitch Conditions & Match Prep",
    "Advanced S&C: Flexibility and Injury Prevention",
    "Personalized Coaching Feedback & Goal Setting",
  ]
};

const provincialInfo: Record<string, { boys: any; girls: any }> = {
  western: {
    boys: { coach: "Mr. Kamal Perera (Former National Batting Consultant)", venue: "R. Premadasa Stadium Nets", location: { lat: 6.9285, lng: 79.8843 } },
    girls: { coach: "Ms. Shalini Weerasinghe (Women's Cricket Development Officer)", venue: "NCC Ground, Colombo", location: { lat: 6.9271, lng: 79.8612 } }
  },
  central: {
    boys: { coach: "Mr. Asanka Gurusinha (Former Test Batsman)", venue: "Asgiriya Stadium Nets, Kandy", location: { lat: 7.2906, lng: 80.6337 } },
    girls: { coach: "Ms. Nilukshi Silva (National Women’s Coach)", venue: "Pallekele International Cricket Stadium Nets", location: { lat: 7.2785, lng: 80.7219 } }
  },
  southern: {
    boys: { coach: "Mr. Chaminda Vaas (Fast Bowling Coach)", venue: "Galle International Stadium Nets", location: { lat: 6.0324, lng: 80.2155 } },
    girls: { coach: "Ms. Inoka Ranaweera (Spin Bowling Specialist)", venue: "Galle Cricket Club Ground", location: { lat: 6.0306, lng: 80.2178 } }
  },
  northern: {
    boys: { coach: "Mr. Muthumudalige Pushpakumara (Former Fast Bowler)", venue: "Jaffna Central College Grounds", location: { lat: 9.6615, lng: 80.0255 } },
    girls: { coach: "Ms. Udeshika Prabodhani (Left‑Arm Swing Specialist)", venue: "Jaffna University Grounds", location: { lat: 9.6770, lng: 80.0262 } }
  },
  eastern: {
    boys: { coach: "Mr. Ruwan Kalpage (All‑Rounder Coach)", venue: "Trincomalee Cricket Stadium", location: { lat: 8.5773, lng: 81.2335 } },
    girls: { coach: "Ms. Hiruka Fernando (Wicket‑Keeping Coach)", venue: "St. Mary's College Ground, Batticaloa", location: { lat: 7.7175, lng: 81.7005 } }
  },
  'north-central': {
    boys: { coach: "Mr. Piyal Wijetunge (Spin Bowling Consultant)", venue: "Anuradhapura Cricket Ground", location: { lat: 8.3114, lng: 80.4037 } },
    girls: { coach: "Ms. Sanduni Abeywickrama (Batting Coach)", venue: "Polonnaruwa Public Grounds", location: { lat: 7.9405, lng: 81.0026 } }
  },
  'north-western': {
    boys: { coach: "Mr. Dilhara Lokuhettige (Fast‑Bowling All‑Rounder)", venue: "Welagedara Stadium, Kurunegala", location: { lat: 7.4863, lng: 80.3660 } },
    girls: { coach: "Ms. Sripali Weerakkody (Pace Bowling Coach)", venue: "Kurunegala Cricket Grounds", location: { lat: 7.4885, lng: 80.3700 } }
  },
  uva: {
    boys: { coach: "Mr. Indika de Saram (Technical Batting Coach)", venue: "Badulla Cricket Ground", location: { lat: 6.9934, lng: 81.0559 } },
    girls: { coach: "Ms. Nipuni Hansika (Middle‑Order Specialist)", venue: "Mahiyanganaya Stadium", location: { lat: 7.3240, lng: 80.9954 } }
  },
  sabaragamuwa: {
    boys: { coach: "Mr. Malinda Warnapura (Former Test Opener)", venue: "Kegalle Cricket Ground", location: { lat: 7.2522, lng: 80.3444 } },
    girls: { coach: "Ms. Chamari Atapattu (Women’s Batting Mentor)", venue: "Rathnapura Public Grounds", location: { lat: 6.6881, lng: 80.4058 } }
  }
};

const provinceDisplayNames: Record<string, string> = {
  'western': 'Western Province',
  'central': 'Central Province',
  'southern': 'Southern Province',
  'northern': 'Northern Province',
  'eastern': 'Eastern Province',
  'north-central': 'North Central Province',
  'north-western': 'North Western Province',
  'uva': 'Uva Province',
  'sabaragamuwa': 'Sabaragamuwa Province'
};

const provinceIds = [
  'western', 'central', 'southern', 'northern', 'eastern',
  'north-central', 'north-western', 'uva', 'sabaragamuwa'
];

const provinceDistrictDetails: Record<string, { count: number; districts: string[] }> = {
  'western': { count: 3, districts: ['Colombo', 'Gampaha', 'Kalutara'] },
  'central': { count: 3, districts: ['Kandy', 'Matale', 'Nuwara Eliya'] },
  'southern': { count: 3, districts: ['Galle', 'Matara', 'Hambantota'] },
  'northern': { count: 3, districts: ['Jaffna', 'Kilinochchi', 'Mannar'] },
  'eastern': { count: 3, districts: ['Trincomalee', 'Batticaloa', 'Ampara'] },
  'north-central': { count: 2, districts: ['Anuradhapura', 'Polonnaruwa'] },
  'north-western': { count: 2, districts: ['Kurunegala', 'Puttalam'] },
  'uva': { count: 2, districts: ['Badulla', 'Monaragala'] },
  'sabaragamuwa': { count: 2, districts: ['Ratnapura', 'Kegalle'] }
};

const playersPerDistrict = 30;
const playersPerProvince = 20;
const totalSessions = 24;




function generateSchedule(provinceId: string, gender: Gender): Session[] {
  // Safety check: if provinceId is missing, fallback to 'western'
  const info = provincialInfo[provinceId]?.[gender] ?? provincialInfo.western[gender];
  const topics = sessionTopics[gender];
  const schedule: Session[] = [];

  for (let i = 0; i < totalSessions; i++) {
    const topicIndex = i % topics.length;
    schedule.push({
      topic: `Session ${i + 1}: ${topics[topicIndex]}`,
      coach: info.coach,
      venue: info.venue,
      location: info.location,
    });
  }

  schedule[totalSessions - 1] = {
    topic: "FINAL SELECTION WORKSHOP: Match Simulation & Evaluation Day",
    coach: "All Coaches & Selection Panel",
    venue: info.venue,
    location: info.location,
  };

  return schedule;
}



export async function getWorkshopsByGender(gender: Gender) {
  try {
    const { data: workshops, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('gender', gender);

    if (error) throw error;

    return workshops.map((w: Workshop) => ({
      province: w.province,
      gender: w.gender,
      coach_name: w.coach_name,
      venue_name: w.venue_name,
      location_lat: w.location_lat,
      location_lng: w.location_lng,
      session_completed_count: w.session_completed_count,
    }));
  } catch (e) {
    console.error('Error fetching workshops, using fallback', e);
    // Use all provinceIds instead of keys of provincialInfo to guarantee all provinces are included
    return provinceIds.map(province => ({
      province,
      gender,
      coach_name: provincialInfo[province][gender].coach,
      venue_name: provincialInfo[province][gender].venue,
      location_lat: provincialInfo[province][gender].location.lat,
      location_lng: provincialInfo[province][gender].location.lng,
      session_completed_count: 0,
    }));
  }
}

export async function getWorkshop(province: string, gender: Gender) {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('province', province)
      .eq('gender', gender)
      .single();

    if (error) throw error;
    return data as Workshop;
  } catch (e) {
    console.error('Error fetching workshop, using fallback', e);
    const info = provincialInfo[province]?.[gender] ?? provincialInfo.western[gender];
    return {
      id: `fallback-${province}-${gender}`,
      province,
      gender,
      coach_name: info.coach,
      venue_name: info.venue,
      location_lat: info.location.lat,
      location_lng: info.location.lng,
      session_completed_count: 0,
      version: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Workshop;
  }
}

export async function updateWorkshop(
  province: string,
  gender: Gender,
  data: Partial<Pick<Workshop, 'coach_name' | 'venue_name' | 'location_lat' | 'location_lng'>>
) {
  const { error } = await supabase
    .from('workshops')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('province', province)
    .eq('gender', gender);

  if (error) throw error;
  return true;
}

export async function completeSession(province: string, gender: Gender) {
  try {
    const { data: workshop, error: fetchError } = await supabase
      .from('workshops')
      .select('id, session_completed_count, version')
      .eq('province', province)
      .eq('gender', gender)
      .single();

    if (fetchError || !workshop) {
      return { success: false, lockStolen: false, newCount: 0 };
    }

    if (workshop.session_completed_count >= totalSessions) {
      return { success: false, lockStolen: false, newCount: workshop.session_completed_count };
    }

    const oldVersion = workshop.version;
    const newCount = workshop.session_completed_count + 1;

    const { data: updatedWorkshop, error: updateError } = await supabase
      .from('workshops')
      .update({
        session_completed_count: newCount,
        version: oldVersion + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workshop.id)
      .eq('version', oldVersion)
      .select('id, session_completed_count')
      .single();

    if (updateError) throw updateError;

    if (!updatedWorkshop) {
      return { success: false, lockStolen: true, newCount: workshop.session_completed_count };
    }

    const sessionIndex = workshop.session_completed_count;
    const topic = generateSchedule(province, gender)[sessionIndex].topic;

    await supabase.from('workshop_sessions').insert({
      workshop_id: workshop.id,
      session_index: sessionIndex,
      topic,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    return { success: true, lockStolen: false, newCount };
  } catch (err) {
    console.error('completeSession error', err);
    return { success: false, lockStolen: false, newCount: 0 };
  }
}

export async function getStatistics(): Promise<Statistics> {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('session_completed_count');

    if (error) throw error;

    const totalSessionsCompleted = data.reduce((acc, w) => acc + w.session_completed_count, 0);
    const totalPossible = provinceIds.length * totalSessions;
    const rate = totalPossible > 0 ? ((totalSessionsCompleted / totalPossible) * 100).toFixed(1) : '0';

    return {
      totalSessions: totalSessionsCompleted,
      totalProvinces: provinceIds.length,
      completionRate: rate,
    };
  } catch (e) {
    console.error('Error fetching statistics', e);
    return { totalSessions: 0, totalProvinces: provinceIds.length, completionRate: '0' };
  }
}

export const staticData = {
  sessionTopics,
  provincialInfo,
  provinceDisplayNames,
  provinceIds,
  provinceDistrictDetails,
  playersPerDistrict,
  playersPerProvince,
  totalSessions,
};

export { generateSchedule };