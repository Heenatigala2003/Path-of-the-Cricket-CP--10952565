'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';                    
import * as workshopService from '@/lib/supabase/workshopService';    
import type { Workshop } from '@/lib/supabase/workshopService';


export interface District {
  id: number;
  name: string;
  date: string;
  venue: string;
  quota: string;
  province: string;
  mapLink: string;
  duration: string;
  groundType: string;
  coordinates: { lat: number; lng: number };
  status: 'UPCOMING' | 'SCHEDULED' | 'LIVE NOW' | 'COMPLETED';
  gender: 'boys' | 'girls';
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  tests: CategoryTest[];
  total: number;
}

export interface CategoryTest {
  name: string;
  description: string;
  points: string;
}

export interface Application {
  id: string;
  districtId: number;
  playerName: string;
  gender: 'boys' | 'girls';
  category: string;
  appliedAt: string;
}

export type Gender = 'boys' | 'girls';

export interface Session {
  topic: string;
  coach: string;
  venue: string;
  location: { lat: number; lng: number };
}

export interface ProvinceInfo {
  boys: { coach: string; venue: string; location: { lat: number; lng: number } };
  girls: { coach: string; venue: string; location: { lat: number; lng: number } };
}

export interface ProvinceStatus {
  index: number;
  schedule: Session[] | null;
}

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

const provincialInfo: Record<string, ProvinceInfo> = {
  western: {
    boys: { 
      coach: "Mr. Heenatigala (Former National Batting Consultant)", 
      venue: "R. Premadasa Stadium Nets",
      location: { lat: 6.9285, lng: 79.8843 }
    },
    girls: { 
      coach: "Ms. Shalini Weerasinghe (Women's Cricket Development Officer)", 
      venue: "NCC Ground, Colombo",
      location: { lat: 6.9271, lng: 79.8612 }
    }
  },
  central: {
    boys: { 
      coach: "Ms. Anusha Kumari (Specialist Spin Consultant)", 
      venue: "Pallekele International Cricket Stadium Ground",
      location: { lat: 7.2795, lng: 80.6421 }
    },
    girls: { 
      coach: "Mr. Ranjith Dissanayake (High Performance Coach)", 
      venue: "Asgiriya Stadium Training Center",
      location: { lat: 7.2964, lng: 80.6350 }
    }
  },
  southern: {
    boys: { 
      coach: "Mr. Dinesh Silva (Level 3 Coach, Fielding Expert)", 
      venue: "Galle International Stadium Practice Area",
      location: { lat: 6.0306, lng: 80.2150 }
    },
    girls: { 
      coach: "Ms. Sanduni Kariyawasam (Former Women's National Team Player)", 
      venue: "Uyanwatta Stadium, Matara",
      location: { lat: 5.9489, lng: 80.5428 }
    }
  },
  northern: {
    boys: { 
      coach: "Mr. V. Thiran (High-Performance Coach)", 
      venue: "Jaffna Central College Grounds",
      location: { lat: 9.6615, lng: 80.0255 }
    },
    girls: { 
      coach: "Ms. Ayesha Sivanathan (Regional Coach Mentor)", 
      venue: "Vavuniya Stadium Practice Facilities",
      location: { lat: 8.7514, lng: 80.4971 }
    }
  },
  eastern: {
    boys: { 
      coach: "Ms. Fathima Rizvi (Fitness & Conditioning Specialist)", 
      venue: "Trincomalee Cricket Club",
      location: { lat: 8.5874, lng: 81.2152 }
    },
    girls: { 
      coach: "Mr. N. Farook (Technical Skills Trainer)", 
      venue: "Batticaloa Play Grounds",
      location: { lat: 7.7167, lng: 81.7000 }
    }
  },
  'north-central': {
    boys: { 
      coach: "Mr. P. Samaraweera (Psychological Consultant)", 
      venue: "Anuradhapura Sports Complex",
      location: { lat: 8.3114, lng: 80.4037 }
    },
    girls: { 
      coach: "Ms. Harshani Wijetunga (Regional Development Coach)", 
      venue: "Polonnaruwa National Ground",
      location: { lat: 7.9403, lng: 81.0189 }
    }
  },
  'north-western': {
    boys: { 
      coach: "Mr. K. Bandara (Former Test Bowler)", 
      venue: "Kurunegala Stadium Practice Pitches",
      location: { lat: 7.4863, lng: 80.3647 }
    },
    girls: { 
      coach: "Ms. Dilani Premaratne (Fast Bowling Consultant)", 
      venue: "Welagedara Stadium, Kurunegala",
      location: { lat: 7.4786, lng: 80.3594 }
    }
  },
  uva: {
    boys: { 
      coach: "Ms. S. Hewage (Conditioning Expert)", 
      venue: "Bandarawela Public Grounds",
      location: { lat: 6.8254, lng: 81.0018 }
    },
    girls: { 
      coach: "Mr. Saman Kumara (Batting Specialist)", 
      venue: "Badulla Stadium Practice Center",
      location: { lat: 6.9895, lng: 81.0557 }
    }
  },
  sabaragamuwa: {
    boys: { 
      coach: "Mr. T. Fernando (Technical Skills Coach)", 
      venue: "Ratnapura Provincial Stadium",
      location: { lat: 6.7050, lng: 80.3843 }
    },
    girls: { 
      coach: "Ms. Ruwani Samarasinghe (Former Captain)", 
      venue: "Kegalle Play Grounds",
      location: { lat: 7.2513, lng: 80.3464 }
    }
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

const totalSessions = 24;

const provinceDistrictDetails: Record<string, { count: number; districts: string[] }> = {
  'western': { count: 3, districts: ['Colombo', 'Gampaha', 'Kalutara'] },
  'central': { count: 3, districts: ['Kandy', 'Matale', 'Nuwara Eliya'] },
  'southern': { count: 3, districts: ['Galle', 'Matara', 'Hambantota'] },
  'northern': { count: 5, districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'] },
  'eastern': { count: 3, districts: ['Batticaloa', 'Ampara', 'Trincomalee'] },
  'north-central': { count: 2, districts: ['Anuradhapura', 'Polonnaruwa'] },
  'north-western': { count: 2, districts: ['Kurunegala', 'Puttalam'] },
  'uva': { count: 2, districts: ['Badulla', 'Monaragala'] },
  'sabaragamuwa': { count: 2, districts: ['Ratnapura', 'Kegalle'] }
};

const playersPerDistrict = 30;
const playersPerProvince = 20;


export default function PracticesPage() {
  const [currentGender, setCurrentGender] = useState<Gender>('boys');
  const [provinceStatus, setProvinceStatus] = useState<Record<string, ProvinceStatus>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalSessions: 0,
    totalProvinces: 9,
    completionRate: '0'
  });
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  const generateSchedule = useCallback((provinceId: string, gender: Gender): Session[] => {
    const info = provincialInfo[provinceId][gender];
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
  }, []);

  const generateScheduleFromWorkshop = useCallback((workshop: any): Session[] => {
    const gender = workshop.gender && (workshop.gender === 'boys' || workshop.gender === 'girls') 
      ? workshop.gender 
      : currentGender;
    
    const topics = sessionTopics[gender];
    if (!topics) {
      console.error('Invalid gender in workshop:', workshop);
      return generateSchedule(workshop.province, currentGender);
    }

    const schedule: Session[] = [];
    for (let i = 0; i < totalSessions; i++) {
      const topicIndex = i % topics.length;
      schedule.push({
        topic: `Session ${i + 1}: ${topics[topicIndex]}`,
        coach: workshop.coach_name,
        venue: workshop.venue_name,
        location: { lat: workshop.location_lat, lng: workshop.location_lng },
      });
    }
    schedule[totalSessions - 1] = {
      topic: "FINAL SELECTION WORKSHOP: Match Simulation & Evaluation Day",
      coach: "All Coaches & Selection Panel",
      venue: workshop.venue_name,
      location: { lat: workshop.location_lat, lng: workshop.location_lng },
    };
    return schedule;
  }, [currentGender, generateSchedule]);

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workshopService.getWorkshopsByGender(currentGender);
      
      const status: Record<string, ProvinceStatus> = {};
      
      data.forEach((workshop: any) => {
        const schedule = generateScheduleFromWorkshop(workshop);
        status[workshop.province] = {
          index: workshop.session_completed_count,
          schedule
        };
      });
      
      provinceIds.forEach(provinceId => {
        if (!status[provinceId]) {
          status[provinceId] = {
            index: 0,
            schedule: generateSchedule(provinceId, currentGender)
          };
        }
      });
      
      setProvinceStatus(status);
      setIsInitialized(true);
      setSupabaseConnected(true);
    } catch (error) {
      console.error('🔥 fetchWorkshops error details:', error);
      initializeStaticData();
      setSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  }, [currentGender, generateScheduleFromWorkshop, generateSchedule]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await workshopService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  const initializeStaticData = useCallback(() => {
    const initialStatus: Record<string, ProvinceStatus> = {};
    
    provinceIds.forEach(provinceId => {
      initialStatus[provinceId] = {
        index: 0,
        schedule: generateSchedule(provinceId, currentGender)
      };
    });

    setProvinceStatus(initialStatus);
    setIsInitialized(true);
    setLoading(false);
  }, [currentGender, generateSchedule]);


  useEffect(() => {
    const channelName = `workshops-${currentGender}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workshops',
          filter: `gender=eq.${currentGender}`,
        },
        (payload) => {
          console.log('🔥 Realtime update received', payload.new);
          const updated = payload.new as any;
          const provinceId = updated.province;

          const newSchedule = generateScheduleFromWorkshop(updated);
          setProvinceStatus((prev) => ({
            ...prev,
            [provinceId]: {
              index: updated.session_completed_count,
              schedule: newSchedule,
            },
          }));

          fetchStatistics();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected for', channelName);
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }, [currentGender, generateScheduleFromWorkshop, fetchStatistics]);


  useEffect(() => {
    fetchWorkshops();
    fetchStatistics();
  }, [fetchWorkshops, fetchStatistics]);

  // Refetch when tab gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchWorkshops();
      fetchStatistics();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchWorkshops, fetchStatistics]);

  const completeSession = async (provinceId: string) => {
    if (completingSession === provinceId) return;
    setCompletingSession(provinceId);
    try {
      const result = await workshopService.completeSession(provinceId, currentGender);

      if (result?.lockStolen) {
        alert('This workshop is being updated in another tab. Please refresh to see the latest changes.');
        fetchWorkshops();
        fetchStatistics();
        setCompletingSession(null);
        return;
      }

      if (result?.success) {
        setProvinceStatus(prev => {
          const current = prev[provinceId];
          if (current && current.index < totalSessions - 1) {
            return {
              ...prev,
              [provinceId]: {
                ...current,
                index: current.index + 1
              }
            };
          }
          return prev;
        });

        fetchWorkshops();
        fetchStatistics();
        alert(`Session ${result.newCount} completed successfully!`);
      } else {
        alert('No pending session to complete or update failed.');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session. Please try again.');
    } finally {
      setCompletingSession(null);
    }
  };

  const getProvincePlayerCount = (provinceId: string) => {
    return provinceDistrictDetails[provinceId].count * playersPerDistrict;
  };

  const getDistrictCount = (provinceId: string) => {
    return provinceDistrictDetails[provinceId].count;
  };

  const getDistrictList = (provinceId: string) => {
    return provinceDistrictDetails[provinceId].districts;
  };

  const ProvinceCard = ({ provinceId }: { provinceId: string }) => {
    const data = provinceStatus[provinceId];
    const isCompleting = completingSession === provinceId;
    
    if (!data || !data.schedule) {
      return (
        <div className="province-card">
          <h3>
            <i className="fas fa-map-marker-alt"></i> {provinceDisplayNames[provinceId]}
          </h3>
          <p className="loading-text">Loading workshop data...</p>
        </div>
      );
    }

    const currentSession = data.schedule[data.index];
    const sessionsCompleted = data.index;
    const isComplete = sessionsCompleted >= totalSessions;
    const progressPercentage = (sessionsCompleted / totalSessions) * 100;
    const totalPlayersInProvince = getProvincePlayerCount(provinceId);
    const districtCount = getDistrictCount(provinceId);
    const districtList = getDistrictList(provinceId);
    
    const mapsUrl = `https://www.google.com/maps?q=${currentSession.location.lat},${currentSession.location.lng}&z=15`;

    return (
      <div className="province-card">
        <h3>
          <i className="fas fa-map-marker-alt"></i> {provinceDisplayNames[provinceId]}
        </h3>
        
        <ul>
          <li>
            <span className="icon fas fa-clock"></span>
            <strong>Time:</strong> Weekends, 8:00 AM - 6:00 PM
          </li>
          <li>
            <span className="icon fas fa-baseball-bat"></span>
            <strong>Topic:</strong> {currentSession.topic}
          </li>
          <li>
            <span className="icon fas fa-user-tie"></span>
            <strong>Head Coach:</strong> {currentSession.coach}
          </li>
          <li>
            <span className="icon fas fa-location-arrow"></span>
            <div>
              <strong>Venue:</strong> {currentSession.venue}
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link"
              >
                <i className="fas fa-map-marked-alt"></i> View on Google Maps
              </a>
            </div>
          </li>
          <li>
            <span className="icon fas fa-map"></span>
            <div>
              <strong>Districts:</strong> {districtCount} districts
              <div className="district-list">
                {districtList.map((district, index) => (
                  <span key={index} className="district-badge">{district}</span>
                ))}
              </div>
            </div>
          </li>
          <li>
            <span className="icon fas fa-users"></span>
            <div>
              <strong>Player Pool:</strong> {totalPlayersInProvince} players
              <span className="small-note">
                ({districtCount} districts × {playersPerDistrict} players each)
              </span>
            </div>
          </li>
          <li>
            <span className="icon fas fa-trophy"></span>
            <div>
              <strong>Final Selection:</strong> Top {playersPerProvince} players
              <span className="small-note">
                (Selection rate: {Math.round((playersPerProvince / totalPlayersInProvince) * 100)}%)
              </span>
            </div>
          </li>
        </ul>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {sessionsCompleted} / {totalSessions} sessions
          </div>
        </div>

        <div className="session-actions">
          <button 
            className="complete-button" 
            onClick={() => completeSession(provinceId)}
            disabled={isComplete || isCompleting || loading}
          >
            {isCompleting ? (
              <> <i className="fas fa-spinner fa-spin"></i> Updating... </>
            ) : isComplete ? (
              'Workshop Complete'
            ) : (
              `Mark Session Complete (${sessionsCompleted}/${totalSessions})`
            )}
          </button>
          
          <div className="session-status">
            {isComplete ? (
              <span className="complete-text">
                <i className="fas fa-check-circle"></i> Final Selections in Progress...
              </span>
            ) : (
              <span className="current-text">
                Current Session: {data.index + 1}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !isInitialized) {
    return (
      <div className="practices-container">
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
        />
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#d1b042', marginBottom: '20px' }}></i>
          <p style={{ color: '#eaf3fb', fontSize: '18px' }}>Loading Workshops...</p>
        </div>
      </div>
    );
  }

  const totalDistricts = Object.values(provinceDistrictDetails).reduce((a, b) => a + b.count, 0);
  const totalPlayersDistrictLevel = totalDistricts * playersPerDistrict;
  const totalPlayersProvincialLevel = provinceIds.length * playersPerProvince;
  const selectionRate = ((totalPlayersProvincialLevel / totalPlayersDistrictLevel) * 100).toFixed(1);

  return (
    <>
      <style jsx global>{`
        
        :root {
          --color-dark-primary: #000000;
          --color-accent-gold: #d1b042;
          --color-light-text: #eaf3fb;
          --color-white: #fff;
          --color-dark-card: #0c0c0c;
          --color-mid-bg: #151515;
          --color-red-alert: #8d2c2c;
          --color-success: #53e51a;
          --color-boys-active: #3f51b5;
          --color-girls-active: #e91e63;
          --color-progress-bg: #2a2a2a;
          --color-progress-fill: #4CAF50;
          --spacing-large: 40px;
          --spacing-medium: 20px;
          --spacing-small: 10px;
          --radius-medium: 15px;
          --radius-small: 8px;
        }

        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          line-height: 1.6;
        }

        .practices-container {
          min-height: 100vh;
          background: var(--color-dark-primary);
          color: var(--color-light-text);
        }

     
        .page-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin: 40px auto;
          position: relative;
          padding: 20px 0;
          width: fit-content;
          flex-direction: column;
        }

        .page-logo {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: contain;
          background: black;
          margin-top: 60px;
          padding: 0px;
        }

        .title-text-container {
          text-align: center;
          position: relative;
          padding: 0px 40px;
        }

        .title-text {
          font-style: normal;
          font-weight: 900;
          font-size: 48px;
          color: #fbbf24;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-shadow: 0 0px 8px rgba(0, 0, 0, 0.5);
          animation: textEnter 1.5s ease-out;
          position: relative;
        }

        .title-text::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 0px;
          background: linear-gradient(90deg, transparent, #c3aa71ff, transparent);
          animation: lineExpand 2s ease-out forwards;
        }

        @keyframes textEnter {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes lineExpand {
          0% { width: 0; }
          100% { width: 80%; }
        }

        .container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 var(--spacing-medium);
        }

        
        .gender-selection-bar {
          max-width: 1000px;
          margin: 0 auto 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: var(--color-dark-card);
          border-radius: var(--radius-medium);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
          flex-wrap: wrap;
        }

        .gender-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-mid-bg);
          color: var(--color-white);
          border: 2px solid transparent;
          padding: 14px 32px;
          border-radius: var(--radius-small);
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          min-width: 180px;
          justify-content: center;
        }

        .gender-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .gender-btn.active-boys {
          background: var(--color-boys-active);
          border-color: var(--color-boys-active);
          box-shadow: 0 0 20px rgba(63, 81, 181, 0.5);
        }

        .gender-btn.active-girls {
          background: var(--color-girls-active);
          border-color: var(--color-girls-active);
          box-shadow: 0 0 20px rgba(233, 30, 99, 0.5);
        }

        .gender-btn i {
          font-size: 18px;
        }

        .section-intro {
          max-width: 1000px;
          margin: 0 auto 50px;
          padding: 30px;
          background: var(--color-dark-card);
          border-radius: var(--radius-medium);
          border-left: 6px solid var(--color-accent-gold);
          text-align: center;
        }

        #section-title {
          color: var(--color-accent-gold);
          font-size: 32px;
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
        }

        #section-title i {
          font-size: 28px;
        }

        .intro-text {
          color: var(--color-light-text);
          font-size: 18px;
          margin-bottom: 30px;
          line-height: 1.8;
        }

        .workshop-summary {
          background: var(--color-mid-bg);
          padding: 25px;
          border-radius: var(--radius-small);
          border: 1px dashed var(--color-accent-gold);
          margin-bottom: 25px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .summary-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          text-align: left;
        }

        .summary-item i {
          color: var(--color-accent-gold);
          font-size: 22px;
          margin-top: 3px;
        }

        .summary-item strong {
          color: var(--color-accent-gold);
          display: block;
          margin-bottom: 5px;
          font-size: 16px;
        }

        .summary-item p {
          color: var(--color-light-text);
          font-size: 14px;
          line-height: 1.5;
        }

        .eligibility-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(141, 44, 44, 0.1);
          border: 1px solid var(--color-red-alert);
          padding: 15px 25px;
          border-radius: var(--radius-small);
          margin-top: 20px;
          font-weight: 600;
        }

        .eligibility-note i {
          color: var(--color-red-alert);
          font-size: 20px;
        }

        .eligibility-note span {
          color: var(--color-light-text);
          font-size: 16px;
        }

        .eligibility-note strong {
          color: var(--color-red-alert);
        }

   
        .province-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
          max-width: 1320px;
          margin: 0 auto 60px;
        }

        .province-card {
          background: var(--color-dark-card);
          padding: 25px;
          border-radius: var(--radius-medium);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          border-top: 4px solid transparent;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .province-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6);
          border-top-color: var(--color-accent-gold);
        }

        .province-card h3 {
          color: var(--color-white);
          font-size: 24px;
          margin-bottom: 20px;
          border-bottom: 2px solid var(--color-accent-gold);
          padding-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .province-card h3 i {
          color: var(--color-accent-gold);
          font-size: 20px;
        }

        .province-card ul {
          list-style: none;
          margin: 0 0 25px 0;
          padding: 0;
          flex-grow: 1;
        }

        .province-card ul li {
          color: var(--color-light-text);
          font-size: 15px;
          margin-bottom: 12px;
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
        }

        .province-card ul li strong {
          color: var(--color-accent-gold);
          min-width: 90px;
          margin-right: 8px;
          font-weight: 600;
        }

        .icon {
          font-size: 16px;
          margin-right: 10px;
          color: var(--color-accent-gold);
          min-width: 20px;
          text-align: center;
        }

        .small-note {
          font-size: 12px;
          color: #aaa;
          margin-top: 4px;
          display: block;
        }

        .district-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 5px;
        }

        .district-badge {
          background: rgba(209, 176, 66, 0.1);
          color: var(--color-accent-gold);
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          border: 1px solid rgba(209, 176, 66, 0.3);
        }

        .map-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4285F4;
          text-decoration: none;
          font-weight: 500;
          margin-top: 5px;
          transition: color 0.3s;
        }

        .map-link:hover {
          color: #8AB4F8;
          text-decoration: underline;
        }

        .map-link i {
          font-size: 14px;
        }

        .progress-container {
          margin-bottom: 20px;
        }

        .progress-bar {
          height: 8px;
          background: var(--color-progress-bg);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-progress-fill), #8BC34A);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          text-align: center;
          color: var(--color-light-text);
          font-size: 13px;
          font-weight: 500;
        }

        .session-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .complete-button {
          width: 100%;
          padding: 14px;
          background: var(--color-success);
          color: var(--color-dark-primary);
          border: none;
          border-radius: var(--radius-small);
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .complete-button:hover:not(:disabled) {
          background: #3fa812;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(83, 229, 26, 0.3);
        }

        .complete-button:disabled {
          background: #555;
          color: #999;
          cursor: not-allowed;
          transform: none;
        }

        .session-status {
          text-align: center;
          min-height: 20px;
        }

        .current-text {
          color: var(--color-accent-gold);
          font-weight: 600;
          font-size: 14px;
        }

        .complete-text {
          color: var(--color-success);
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .loading-text {
          color: var(--color-accent-gold);
          text-align: center;
          font-style: italic;
          padding: 20px;
        }

        .offline-banner {
          background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
          color: white;
          padding: 15px 25px;
          border-radius: var(--radius-small);
          margin: 20px auto;
          max-width: 1000px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
        }

        .offline-banner i {
          font-size: 24px;
        }

        .offline-banner span {
          font-weight: 600;
        }

        .selection-process-section {
          max-width: 1000px;
          margin: 60px auto;
          padding: 40px;
          background: var(--color-dark-card);
          border-radius: var(--radius-medium);
          border: 1px solid rgba(209, 176, 66, 0.3);
        }

        .process-explanation h3 {
          color: var(--color-accent-gold);
          font-size: 28px;
          margin-bottom: 40px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 30px;
          margin-bottom: 50px;
        }

        .process-step {
          display: flex;
          gap: 25px;
          align-items: flex-start;
          padding: 25px;
          background: var(--color-mid-bg);
          border-radius: var(--radius-medium);
          border-left: 5px solid var(--color-accent-gold);
          transition: transform 0.3s ease;
        }

        .process-step:hover {
          transform: translateX(10px);
        }

        .step-number {
          background: var(--color-accent-gold);
          color: var(--color-dark-primary);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .step-content h4 {
          color: var(--color-white);
          font-size: 20px;
          margin-bottom: 10px;
        }

        .step-content p {
          color: var(--color-light-text);
          margin-bottom: 15px;
          line-height: 1.6;
        }

        .step-stats .stat-badge {
          display: inline-block;
          background: rgba(209, 176, 66, 0.1);
          color: var(--color-accent-gold);
          padding: 8px 16px;
          border-radius: var(--radius-small);
          font-size: 14px;
          font-weight: 600;
          border: 1px solid rgba(209, 176, 66, 0.3);
        }

        .calculation-table {
          margin-top: 40px;
        }

        .calculation-table h4 {
          color: var(--color-accent-gold);
          font-size: 22px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .calculation-table table {
          width: 100%;
          border-collapse: collapse;
          background: var(--color-mid-bg);
          border-radius: var(--radius-small);
          overflow: hidden;
        }

        .calculation-table th {
          background: var(--color-accent-gold);
          color: var(--color-dark-primary);
          padding: 15px;
          text-align: left;
          font-weight: 700;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .calculation-table td {
          padding: 15px;
          color: var(--color-light-text);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .calculation-table tr:hover {
          background: rgba(209, 176, 66, 0.05);
        }

        .calculation-table tfoot {
          background: rgba(209, 176, 66, 0.1);
        }

        .calculation-table tfoot td {
          color: var(--color-accent-gold);
          font-weight: 700;
          font-size: 16px;
        }

        .reminder-banner {
          max-width: 1000px;
          margin: 50px auto;
          padding: 30px;
          background: linear-gradient(135deg, #d1b042 0%, #ffd700 100%);
          color: var(--color-dark-primary);
          border-radius: var(--radius-medium);
          box-shadow: 0 8px 32px rgba(209, 176, 66, 0.4);
        }

        .reminder-content {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .reminder-content i {
          font-size: 40px;
          color: var(--color-dark-primary);
        }

        .reminder-content h3 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--color-dark-primary);
        }

        .reminder-content p {
          font-size: 16px;
          margin-bottom: 15px;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.9);
        }

        .profile-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-dark-primary);
          color: var(--color-accent-gold);
          padding: 10px 20px;
          border-radius: var(--radius-small);
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
        }

        .profile-link:hover {
          background: #cf5c5cff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          max-width: 1000px;
          margin: 50px auto;
          padding: 0 var(--spacing-medium);
        }

        .stat-card {
          background: var(--color-dark-card);
          padding: 25px 20px;
          border-radius: var(--radius-medium);
          text-align: center;
          transition: transform 0.3s ease;
          border: 1px solid rgba(209, 176, 66, 0.2);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--color-accent-gold);
        }

        .stat-card i {
          font-size: 36px;
          color: var(--color-accent-gold);
          margin-bottom: 15px;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 800;
          color: var(--color-white);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--color-light-text);
          line-height: 1.4;
        }

        @media (max-width: 1200px) {
          .province-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        }

        @media (max-width: 992px) {
          .title-text { font-size: 36px; }
          #section-title { font-size: 28px; }
          .summary-grid { grid-template-columns: 1fr; }
          .reminder-content { flex-direction: column; text-align: center; gap: 20px; }
        }

        @media (max-width: 768px) {
          .page-header { margin: 20px auto; }
          .title-text { font-size: 28px; }
          .gender-selection-bar { flex-direction: column; gap: 15px; }
          .gender-btn { width: 100%; max-width: 300px; }
          .province-grid { grid-template-columns: 1fr; }
          .section-intro { padding: 20px; }
          #section-title { font-size: 24px; flex-direction: column; gap: 10px; }
          .stats-section { grid-template-columns: repeat(2, 1fr); }
          .process-step { flex-direction: column; gap: 15px; }
          .step-number { align-self: center; }
          .calculation-table { overflow-x: auto; }
          .calculation-table table { min-width: 800px; }
        }

        @media (max-width: 480px) {
          .title-text { font-size: 24px; }
          .province-card { padding: 20px; }
          .province-card h3 { font-size: 20px; }
          .complete-button { padding: 12px; font-size: 14px; }
          .stats-section { grid-template-columns: 1fr; }
          .stat-card { padding: 20px; }
          .selection-process-section { padding: 20px; }
          .process-step { padding: 20px; }
        }
      `}</style>
      
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
      />
      
      <div className="practices-container">
        <div className="page-header">
          <img src="/image55.png" alt="Path of Cricket Logo" className="page-logo" />
          <div className="title-text-container">
            <h1 className="title-text">PATH OF THE CRICKET</h1>
          </div>
        </div>

        <div className="container">
          {!supabaseConnected && (
            <div className="offline-banner">
              <i className="fas fa-wifi-slash"></i>
              <span>Using local data - Supabase connection failed</span>
            </div>
          )}

          <div className="gender-selection-bar">
            <button 
              className={`gender-btn ${currentGender === 'boys' ? 'active-boys' : ''}`}
              onClick={() => setCurrentGender('boys')}
            >
              <i className="fas fa-male"></i> Boys Workshops
            </button>
            
            <button 
              className={`gender-btn ${currentGender === 'girls' ? 'active-girls' : ''}`}
              onClick={() => setCurrentGender('girls')}
            >
              <i className="fas fa-female"></i> Girls Workshops
            </button>
          </div>

          <section className="section-intro">
            <h2 id="section-title">
              <i className="fas fa-chalkboard-teacher"></i> 
              Provincial Talent Development Workshops ({currentGender === 'boys' ? 'Boys' : 'Girls'})
            </h2>
            
            <p className="intro-text">
              Welcome to the next phase of your cricketing journey! These intensive Provincial Workshops 
              are the crucial step for identified talent, focusing on advanced skill development, tactical 
              awareness, and physical conditioning.
            </p>
            
            <div className="workshop-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <i className="fas fa-calendar-start"></i>
                  <div>
                    <strong>Start Date:</strong>
                    <p>1st Saturday after District Selections</p>
                  </div>
                </div>
                
                <div className="summary-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Duration:</strong>
                    <p>3 Months (12 Weekends / 24 Sessions)</p>
                  </div>
                </div>
                
                <div className="summary-item">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <strong>Timing:</strong>
                    <p>8:00 AM to 6:00 PM (Daily Sessions)</p>
                  </div>
                </div>
                
                <div className="summary-item">
                  <i className="fas fa-bullseye"></i>
                  <div>
                    <strong>Goal:</strong>
                    <p>Select 20 top players per province via our Selection Algorithm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="eligibility-note">
              <i className="fas fa-exclamation-triangle"></i> 
              <span>
                <strong>ELIGIBILITY:</strong> Practices are strictly for District-Level Selected Players Only.
              </span>
            </div>
          </section>

          <div className="province-grid">
            {provinceIds.map((provinceId) => (
              <ProvinceCard key={provinceId} provinceId={provinceId} />
            ))}
          </div>

          <section className="selection-process-section">
            <div className="process-explanation">
              <h3><i className="fas fa-sitemap"></i> Selection Process Flow</h3>
              
              <div className="process-steps">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>District Level Selection</h4>
                    <p>Each district selects top <strong>30 players</strong> (boys/girls separately) from local competitions</p>
                    <div className="step-stats">
                      <span className="stat-badge">{totalDistricts} Districts × {playersPerDistrict} = {totalPlayersDistrictLevel} players</span>
                    </div>
                  </div>
                </div>
                
                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Provincial Workshops</h4>
                    <p>All district-selected players from the same province attend 24 intensive training sessions</p>
                    <div className="step-stats">
                      <span className="stat-badge">Example: Western Province (3 districts × 30) = 90 players in workshops</span>
                    </div>
                  </div>
                </div>
                
                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Final Provincial Selection</h4>
                    <p>After 24 sessions, the selection panel chooses top <strong>20 players</strong> per province for national pool</p>
                    <div className="step-stats">
                      <span className="stat-badge">{provinceIds.length} Provinces × {playersPerProvince} = {totalPlayersProvincialLevel} National Players</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="calculation-table">
                <h4><i className="fas fa-table"></i> Provincial Player Distribution</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Province</th>
                      <th>Districts</th>
                      <th>Players per District</th>
                      <th>Total in Workshop</th>
                      <th>Final Selection</th>
                      <th>Selection Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provinceIds.map(provinceId => {
                      const provinceDetail = provinceDistrictDetails[provinceId];
                      const districts = provinceDetail.count;
                      const totalInWorkshop = districts * playersPerDistrict;
                      const selectionRateProvince = ((playersPerProvince / totalInWorkshop) * 100).toFixed(1);
                      
                      return (
                        <tr key={provinceId}>
                          <td>{provinceDisplayNames[provinceId]}</td>
                          <td>{districts}</td>
                          <td>{playersPerDistrict}</td>
                          <td>{totalInWorkshop}</td>
                          <td>{playersPerProvince}</td>
                          <td>{selectionRateProvince}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2}><strong>Total</strong></td>
                      <td><strong>{playersPerDistrict}</strong></td>
                      <td><strong>{totalPlayersDistrictLevel}</strong></td>
                      <td><strong>{totalPlayersProvincialLevel}</strong></td>
                      <td><strong>{selectionRate}%</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>

          <section className="reminder-banner">
            <div className="reminder-content">
              <i className="fas fa-id-card"></i>
              <div>
                <h3>IMPORTANT REMINDER</h3>
                <p>
                  Please ensure your User Profile is fully updated with the latest 
                  contact and medical information before attending the first workshop.
                </p>
                <a href="/user-profile" className="profile-link">
                  <i className="fas fa-external-link-alt"></i> Go to User Profile
                </a>
              </div>
            </div>
          </section>

          <div className="stats-section">
            <div className="stat-card">
              <i className="fas fa-users"></i>
              <div className="stat-number">{totalPlayersDistrictLevel}</div>
              <div className="stat-label">District Level Players</div>
            </div>
            
            <div className="stat-card">
              <i className="fas fa-map-marked-alt"></i>
              <div className="stat-number">{provinceIds.length}</div>
              <div className="stat-label">Provinces</div>
            </div>
            
            <div className="stat-card">
              <i className="fas fa-calendar-check"></i>
              <div className="stat-number">{statistics.totalSessions}</div>
              <div className="stat-label">Completed Sessions</div>
            </div>
            
            <div className="stat-card">
              <i className="fas fa-trophy"></i>
              <div className="stat-number">{totalPlayersProvincialLevel}</div>
              <div className="stat-label">Final National Pool</div>
            </div>

            <div className="stat-card">
              <i className="fas fa-percentage"></i>
              <div className="stat-number">{statistics.completionRate}%</div>
              <div className="stat-label">Overall Completion</div>
            </div>
            
            <div className="stat-card">
              <i className="fas fa-filter"></i>
              <div className="stat-number">{playersPerProvince}</div>
              <div className="stat-label">Per Province Selection</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}