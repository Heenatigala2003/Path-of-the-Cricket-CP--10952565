"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import { supabase } from "@/utils/supabase-client";

interface PlayerProfile {
  id: string;
  name: string;
  role: string;
  district: string;
  battingPoints: number;
  bowlingPoints: number;
  annualRank: number;
  height: number;
  weight: number;
  school: string;
  dob: string;
  preferredFormat: string;
  gender: 'male' | 'female';
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

interface SelectionStatus {
  district: "PENDING" | "REGISTERED" | "SELECTED" | "DENIED";
  annual: "NOT_YET_ELIGIBLE" | "SELECTED" | "NOT_SELECTED";
  profileAccess: "DENIED" | "ACCESS_GRANTED";
  registeredDistrict?: string;
}

export default function UserProfilePage() {
  // State Management
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [selectionStatus, setSelectionStatus] = useState<SelectionStatus>({
    district: "PENDING",
    annual: "NOT_YET_ELIGIBLE",
    profileAccess: "DENIED"
  });
  const [sponsorshipStatus, setSponsorshipStatus] = useState("Pending Submission");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    district: "",
    primaryRole: "",
    gender: "" as 'male' | 'female' | ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userGender, setUserGender] = useState<'male' | 'female' | ''>('');
  const [districtCapacity, setDistrictCapacity] = useState<{count: number, max: number, available: boolean} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const fetchUserData = async (email: string, gender: 'male' | 'female') => {
    try {
     
      const { data: players, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .eq('gender', gender);

      if (playerError) throw playerError;

      if (!players || players.length === 0) {

        localStorage.removeItem("cricket_user_email");
        localStorage.removeItem("cricket_user_gender");
        setIsRegistered(false);
        return;
      }

      const player = players[0];
      setIsRegistered(true);
      setUserGender(player.gender);

      setFormData({
        fullName: player.full_name,
        email: player.email,
        district: player.district,
        primaryRole: player.primary_role,
        gender: player.gender
      });

      
      const { data: selectionData, error: selectionError } = await supabase
        .from('district_selections')
        .select('status, district')
        .eq('player_id', player.id)
        .maybeSingle();

      if (!selectionError && selectionData) {
        setSelectionStatus(prev => ({
          ...prev,
          district: selectionData.status as any,
          registeredDistrict: selectionData.district
        }));
      } else {
        setSelectionStatus(prev => ({ ...prev, district: "PENDING" }));
      }

    
      const { data: annualData, error: annualError } = await supabase
        .from('annual_selections')
        .select('status, profile_access, rank')
        .eq('player_id', player.id)
        .eq('year', new Date().getFullYear())
        .maybeSingle();

      if (!annualError && annualData) {
        setSelectionStatus(prev => ({
          ...prev,
          annual: annualData.status as any,
          profileAccess: annualData.profile_access as any
        }));
      }

      const { data: profileData, error: profileError } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('player_id', player.id)
        .maybeSingle();

      if (!profileError && profileData) {
        setPlayerProfile({
          id: player.id,
          name: player.full_name,
          role: player.primary_role,
          district: player.district,
          battingPoints: profileData.batting_points || 0,
          bowlingPoints: profileData.bowling_points || 0,
          annualRank: profileData.annual_rank || 0,
          height: profileData.height || 170,
          weight: profileData.weight || 65,
          school: profileData.school || '',
          dob: profileData.dob || '2000-01-01',
          preferredFormat: profileData.preferred_format || 'ODI',
          gender: player.gender,
          avatar_url: profileData.avatar_url,
          matches: profileData.matches || 0,
          runs: profileData.runs || 0,
          wickets: profileData.wickets || 0,
          best_bowling: profileData.best_bowling || '',
          batting_strike_rate: profileData.batting_strike_rate,
          bowling_economy: profileData.bowling_economy,
          highest_score: profileData.highest_score,
          fifties: profileData.fifties,
          hundreds: profileData.hundreds
        });
      } else {
      
        setPlayerProfile({
          id: player.id,
          name: player.full_name,
          role: player.primary_role,
          district: player.district,
          battingPoints: 0,
          bowlingPoints: 0,
          annualRank: 0,
          height: 170,
          weight: 65,
          school: '',
          dob: '2000-01-01',
          preferredFormat: 'ODI',
          gender: player.gender,
          avatar_url: undefined,
          matches: 0,
          runs: 0,
          wickets: 0,
          best_bowling: '',
          batting_strike_rate: undefined,
          bowling_economy: undefined,
          highest_score: undefined,
          fifties: undefined,
          hundreds: undefined
        });
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkUserRegistration = async () => {
      let storedEmail: string | null = null;
      let storedGender: 'male' | 'female' | null = null;

      try {
        storedEmail = localStorage.getItem("cricket_user_email");
        storedGender = localStorage.getItem("cricket_user_gender") as 'male' | 'female' | null;
      } catch (e) {
        console.error("localStorage error:", e);
        setError("Unable to access local storage. Please clear your browser cache and try again.");
        return;
      }

      if (!storedEmail || !storedGender) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await fetchUserData(storedEmail, storedGender);
      } catch (error: any) {
        console.error('Error checking registration:', error);
        setError(error.message || 'Error checking registration status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRegistration();
  }, []);

  useEffect(() => {
    const checkCapacity = async () => {
      if (formData.district && formData.gender) {
        try {
          const { count, error } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('district', formData.district)
            .eq('gender', formData.gender);

          if (error) throw error;

          const maxCapacity = 30;
          const currentCount = count || 0;
          setDistrictCapacity({
            count: currentCount,
            max: maxCapacity,
            available: currentCount < maxCapacity
          });
          setError(null);
        } catch (error: any) {
          console.error('Error checking capacity:', error);
          setError(error.message || 'Error checking district capacity.');
        }
      }
    };

    if (formData.district && formData.gender) {
      checkCapacity();
    }
  }, [formData.district, formData.gender]);

 
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.district || !formData.gender) {
      setError("Please select your district and gender to register.");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.primaryRole) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
   
      const { data: existingPlayers, error: checkError } = await supabase
        .from('players')
        .select('gender')
        .eq('email', formData.email);

      if (checkError) throw checkError;

      if (existingPlayers && existingPlayers.length > 0) {
        const existing = existingPlayers[0];
        setError(`This email is already registered as ${existing.gender === 'male' ? 'Boy' : 'Girl'}. Please use a different email.`);
        setIsLoading(false);
        return;
      }

      
      const { count, error: countError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('district', formData.district)
        .eq('gender', formData.gender);

      if (countError) throw countError;

      const maxCapacity = 30;
      if (count && count >= maxCapacity) {
        setError(`Sorry, ${formData.district} district has reached its maximum capacity for ${formData.gender === 'male' ? 'boys' : 'girls'} (${maxCapacity} players). Please try another district.`);
        setIsLoading(false);
        return;
      }

     
      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          district: formData.district,
          primary_role: formData.primaryRole,
          gender: formData.gender
        })
        .select()
        .single();

      if (insertError) throw insertError;


      const { error: selectionError } = await supabase
        .from('district_selections')
        .insert({
          player_id: newPlayer.id,
          district: formData.district,
          status: 'PENDING'
        });

      if (selectionError) {
        console.warn('Could not create selection record:', selectionError);
      }

      setIsRegistered(true);
      setUserGender(formData.gender);
      setShowRegistrationForm(false);

      setSelectionStatus({
        district: "REGISTERED",
        annual: "NOT_YET_ELIGIBLE",
        profileAccess: "DENIED",
        registeredDistrict: formData.district
      });

      localStorage.setItem("cricket_user_email", formData.email);
      localStorage.setItem("cricket_user_gender", formData.gender);

      alert(`✅ Registration successful for ${formData.district} district! You will be notified when selection results are available.`);
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "An error occurred during registration. Please try again.";
      if (error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = "This email is already registered. Please use a different email.";
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !playerProfile) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('playerId', playerProfile.id);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      const avatarUrlWithTimestamp = `${data.avatar_url}?t=${Date.now()}`;
      setPlayerProfile(prev => prev ? { ...prev, avatar_url: avatarUrlWithTimestamp } : null);
      alert('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

 
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!playerProfile) return;

    setIsLoading(true);

    try {
      const storedEmail = localStorage.getItem("cricket_user_email");
      const storedGender = localStorage.getItem("cricket_user_gender") as 'male' | 'female';

      if (!storedEmail || !storedGender) {
        setError("User not found. Please register first.");
        return;
      }

      console.log('Updating player role...');
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({ primary_role: playerProfile.role })
        .eq('id', playerProfile.id);

      if (playerUpdateError) {
        console.error('Player update error:', playerUpdateError);
        throw new Error(`Player update failed: ${playerUpdateError.message}`);
      }

   
      console.log('Upserting player profile...');
      const profileData = {
        player_id: playerProfile.id,
        batting_points: playerProfile.battingPoints,
        bowling_points: playerProfile.bowlingPoints,
        annual_rank: playerProfile.annualRank,
        height: playerProfile.height,
        weight: playerProfile.weight,
        school: playerProfile.school,
        dob: playerProfile.dob,
        preferred_format: playerProfile.preferredFormat,
        avatar_url: playerProfile.avatar_url,
        matches: playerProfile.matches,
        runs: playerProfile.runs,
        wickets: playerProfile.wickets,
        best_bowling: playerProfile.best_bowling,
        batting_strike_rate: playerProfile.batting_strike_rate,
        bowling_economy: playerProfile.bowling_economy,
        highest_score: playerProfile.highest_score,
        fifties: playerProfile.fifties,
        hundreds: playerProfile.hundreds
      };

      const { error: profileUpsertError } = await supabase
        .from('player_profiles')
        .upsert(profileData, { onConflict: 'player_id' });

      if (profileUpsertError) {
        console.error('Profile upsert error:', profileUpsertError);
        throw new Error(`Profile upsert failed: ${profileUpsertError.message}`);
      }

      alert("Profile updated successfully!");

      const { data: refreshedProfile, error: refreshError } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('player_id', playerProfile.id)
        .maybeSingle();

      if (!refreshError && refreshedProfile) {
        setPlayerProfile(prev => prev ? {
          ...prev,
          battingPoints: refreshedProfile.batting_points,
          bowlingPoints: refreshedProfile.bowling_points,
          annualRank: refreshedProfile.annual_rank,
          height: refreshedProfile.height,
          weight: refreshedProfile.weight,
          school: refreshedProfile.school,
          dob: refreshedProfile.dob,
          preferredFormat: refreshedProfile.preferred_format,
          avatar_url: refreshedProfile.avatar_url,
          matches: refreshedProfile.matches,
          runs: refreshedProfile.runs,
          wickets: refreshedProfile.wickets,
          best_bowling: refreshedProfile.best_bowling,
          batting_strike_rate: refreshedProfile.batting_strike_rate,
          bowling_economy: refreshedProfile.bowling_economy,
          highest_score: refreshedProfile.highest_score,
          fifties: refreshedProfile.fifties,
          hundreds: refreshedProfile.hundreds
        } : prev);
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      setError(error.message || "An error occurred while updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorshipApplication = () => {
    setSponsorshipStatus("Application Sent (Pending Sponsor Review)");
    alert("Sponsorship request sent to sponsors portal!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
      case "REGISTERED":
        return "text-yellow-500";
      case "SELECTED":
      case "ACCESS_GRANTED":
        return "text-green-500";
      case "DENIED":
      case "NOT_SELECTED":
      case "NOT_YET_ELIGIBLE":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (status: string, additionalInfo?: string) => {
    switch (status) {
      case "PENDING":
        return "PENDING";
      case "REGISTERED":
        return `REGISTERED (${additionalInfo})`;
      case "SELECTED":
        return "SELECTED";
      case "ACCESS_GRANTED":
        return "ACCESS GRANTED";
      case "DENIED":
        return "DENIED";
      case "NOT_YET_ELIGIBLE":
        return "NOT YET ELIGIBLE";
      case "NOT_SELECTED":
        return "NOT SELECTED";
      default:
        return status;
    }
  };

  const getGenderDisplay = (gender: string) => {
    return gender === 'male' ? '♂ Boys Category' : '♀ Girls Category';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-yellow-400 text-xl">Loading...</div>
        </div>
      )}

      <main className="pt-24 pb-16">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="relative w-30 h-30 mb-4">
              <Image
                src="/image55.png"
                alt="Cricket Icon"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="rounded-full"
                style={{ objectFit: "contain" }}
              />
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-wider text-yellow-400 text-center">
              PATH OF THE CRICKET
            </h1>
            {userGender && (
              <div className={`px-4 py-2 rounded-full font-bold ${userGender === 'male' ? 'bg-blue-900 text-blue-300' : 'bg-pink-900 text-pink-300'}`}>
                {getGenderDisplay(userGender)}
              </div>
            )}
          </div>
          <div className="w-80 h-1 bg-yellow-800"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300 font-medium">Error: {error}</p>
            </div>
          )}

          <div className="bg-gray-900 border border-yellow-700 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-10">
              Selection Status & Portal Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-yellow-500 font-semibold text-lg mb-2">
                  District Selection (Initial)
                </h3>
                <p className={`text-2xl font-bold mb-4 ${getStatusColor(selectionStatus.district)}`}>
                  {getStatusText(selectionStatus.district, selectionStatus.registeredDistrict)}
                </p>
                {selectionStatus.district === "REGISTERED" && (
                  <div className="mt-2 p-2 bg-blue-900/30 rounded">
                    <p className="text-sm text-blue-300">
                      Awaiting district selection results...
                    </p>
                  </div>
                )}
                {!isRegistered && (
                  <button
                    onClick={() => {
                      setShowRegistrationForm(!showRegistrationForm);
                      setError(null);
                    }}
                    className="bg-green-500 text-black px-4 py-2 rounded font-semibold hover:bg-green-600 transition mt-4"
                    disabled={isLoading}
                  >
                    {showRegistrationForm ? "Hide Form" : "Register Now"}
                  </button>
                )}
              </div>

              <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-yellow-500 font-semibold text-lg mb-2">
                  Annual Selection (Top 750)
                </h3>
                <p className={`text-2xl font-bold mb-4 ${getStatusColor(selectionStatus.annual)}`}>
                  {getStatusText(selectionStatus.annual)}
                </p>
                {selectionStatus.annual === "SELECTED" && playerProfile?.annualRank && (
                  <div className="mt-2 p-2 bg-green-900/30 rounded">
                    <p className="text-sm text-green-300">
                      Your Rank: #{playerProfile.annualRank}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  {selectionStatus.annual === "SELECTED"
                    ? "Congratulations! You are in Top 750"
                    : selectionStatus.annual === "NOT_YET_ELIGIBLE"
                    ? "Eligible after district selection"
                    : "Not selected for annual ranking"}
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-yellow-500 font-semibold text-lg mb-2">
                  Profile Creation Access
                </h3>
                <p className={`text-2xl font-bold mb-2 ${getStatusColor(selectionStatus.profileAccess)}`}>
                  {getStatusText(selectionStatus.profileAccess)}
                </p>
                <p className="text-sm text-gray-400">
                  {selectionStatus.profileAccess === "ACCESS_GRANTED"
                    ? "Full access granted"
                    : "Access granted upon Annual Selection"}
                </p>
                {selectionStatus.profileAccess === "ACCESS_GRANTED" && (
                  <div className="mt-4">
                    <button
                      onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                      className="text-yellow-400 text-sm hover:underline"
                    >
                      View/Edit Profile ↓
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showRegistrationForm && !isRegistered && (
            <div className="bg-gray-800 p-8 rounded-2xl mb-8 border-l-4 border-green-500">
              <h2 className="text-2xl font-bold mb-4">District Selection Registration</h2>
              <p className="text-gray-300 mb-6">
                Complete this form to participate in the District Selection process....
              </p>

              {districtCapacity && formData.district && formData.gender && (
                <div className={`mb-6 p-4 rounded-lg ${districtCapacity.available ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  <h3 className="font-bold mb-2">
                    {formData.district} District - {formData.gender === 'male' ? 'Boys' : 'Girls'} Capacity
                  </h3>
                  <p className={districtCapacity.available ? 'text-green-300' : 'text-red-300'}>
                    {districtCapacity.count} / {districtCapacity.max} {formData.gender === 'male' ? 'boys' : 'girls'} registered
                    {districtCapacity.available
                      ? ` (${districtCapacity.max - districtCapacity.count} spots available)`
                      : ' (FULL - No spots available)'}
                  </p>
                </div>
              )}

              <form onSubmit={handleRegistrationSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name (As per NIC/GS Certificate) *"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address (for portal login) *"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Gender Category *</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${formData.gender === 'male' ? 'bg-blue-900 border-2 border-blue-500' : 'bg-gray-700 border border-gray-600'}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleInputChange}
                          className="mr-2"
                          required
                          disabled={isLoading}
                        />
                        <span className="font-bold text-blue-300">♂ Boys</span>
                        <span className="block text-xs text-gray-400 mt-1">Max: 30 per district</span>
                      </label>
                      <label className={`flex-1 p-3 rounded-lg cursor-pointer transition-all ${formData.gender === 'female' ? 'bg-pink-900 border-2 border-pink-500' : 'bg-gray-700 border border-gray-600'}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleInputChange}
                          className="mr-2"
                          required
                          disabled={isLoading}
                        />
                        <span className="font-bold text-pink-300">♀ Girls</span>
                        <span className="block text-xs text-gray-400 mt-1">Max: 30 per district</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select District *</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Matale">Matale</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Vavuniya">Vavuniya</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Ampara">Ampara</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Monaragala">Monaragala</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Kegalle">Kegalle</option>
                    </select>
                  </div>

                  <div>
                    <select
                      name="primaryRole"
                      value={formData.primaryRole}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select Primary Role *</option>
                      <option value="Batter">Batter</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-Rounder">All-Rounder</option>
                      <option value="Wicket-Keeper">Wicket-Keeper</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    className="bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                    disabled={isLoading || (districtCapacity && !districtCapacity.available)}
                  >
                    {isLoading ? "Submitting..." : "Submit Registration"}
                  </button>

                  {districtCapacity && !districtCapacity.available && (
                    <span className="text-red-400 text-sm">
                      District is full. Please select another district.
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {selectionStatus.profileAccess === "ACCESS_GRANTED" && playerProfile && (
            <div className="animate-fade-in">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-32 h-32">
                    {playerProfile.avatar_url ? (
                      <Image
                        key={playerProfile.avatar_url}
                        src={playerProfile.avatar_url}
                        alt="Profile"
                        fill
                        sizes="96px"
                        className="rounded-full object-cover"
                        onError={() => console.log('Image failed to load')}
                      />
                    ) : (
                      <div className={`w-full h-full rounded-full border-4 ${playerProfile.gender === 'male' ? 'border-blue-600' : 'border-pink-600'} bg-gray-700 flex items-center justify-center text-4xl`}>
                        {playerProfile.gender === 'male' ? '♂' : '♀'}
                      </div>
                    )}
                    <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full font-bold text-xs ${playerProfile.gender === 'male' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                      {playerProfile.gender === 'male' ? '♂' : '♀'}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{playerProfile.name}</h1>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${playerProfile.gender === 'male' ? 'bg-blue-900 text-blue-300' : 'bg-pink-900 text-pink-300'}`}>
                          {playerProfile.gender === 'male' ? 'Boys Category' : 'Girls Category'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-900 text-green-300">
                          Top 750 Selected
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 italic mb-6">
                      {playerProfile.role} | {playerProfile.district} District
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-8">
                      <div className="text-center">
                        <span className="block text-gray-400 text-sm">Batting Points</span>
                        <span className="block text-green-500 text-2xl font-bold">
                          {playerProfile.battingPoints}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-gray-400 text-sm">Bowling Points</span>
                        <span className="block text-green-500 text-2xl font-bold">
                          {playerProfile.bowlingPoints}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-gray-400 text-sm">Annual Rank</span>
                        <span className="block text-green-500 text-2xl font-bold">
                          #{playerProfile.annualRank}
                        </span>
                      </div>
                      {playerProfile.dob && (
                        <div className="text-center">
                          <span className="block text-gray-400 text-sm">Date of Birth</span>
                          <span className="block text-yellow-500 text-lg font-bold">
                            {formatDate(playerProfile.dob)}
                          </span>
                        </div>
                      )}
                    </div>

                    {playerProfile.best_bowling && (
                      <div className="mt-4 text-center md:text-left">
                        <span className="text-gray-400 mr-2">Best Bowling:</span>
                        <span className="text-yellow-400 font-bold">{playerProfile.best_bowling}</span>
                      </div>
                    )}

                    <div className="mt-4">
                      <Link href="/ranking" className="text-yellow-400 hover:underline">
                        View Rankings →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-2xl border-l-4 border-yellow-600">
                  <h2 className="text-xl font-bold mb-4">Sponsorship & Finance 💰</h2>
                  <p className="text-gray-300 mb-6">
                    Upload necessary documents and apply for sponsorship.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Grama Seva Certificate (for verification)
                      </label>
                      <input
                        type="file"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        accept=".pdf,.jpg,.png"
                        disabled={isLoading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            console.log('File selected:', e.target.files[0].name);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Bank Details Proof (for payments)
                      </label>
                      <input
                        type="file"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        accept=".pdf"
                        disabled={isLoading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            console.log('File selected:', e.target.files[0].name);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSponsorshipApplication}
                    className="bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-700 transition mb-4"
                    disabled={isLoading}
                  >
                    Apply for Sponsorship
                  </button>

                  <p className="text-gray-300">
                    Status: <span className="font-semibold text-yellow-500">{sponsorshipStatus}</span>
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border-l-4 border-green-500">
                  <h2 className="text-xl font-bold mb-4">Personal & Cricket Details 👤</h2>

                  <form onSubmit={handleProfileUpdate}>
                    <div className="mb-6">
                      <label className="block text-gray-400 text-sm mb-2">Profile Picture</label>
                      <div className="flex items-center gap-4">
                        {playerProfile.avatar_url ? (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              key={playerProfile.avatar_url}
                              src={playerProfile.avatar_url}
                              alt="Avatar"
                              fill
                              sizes="64px"
                              className="object-cover"
                              onError={() => console.log('Image failed to load')}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                            {playerProfile.gender === 'male' ? '♂' : '♀'}
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="text-sm text-gray-400"
                          disabled={uploading}
                        />
                        {uploading && <span className="text-yellow-400">Uploading...</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Height (cm)</label>
                        <input
                          type="number"
                          value={playerProfile.height || ''}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            height: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          min="100"
                          max="250"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          value={playerProfile.weight || ''}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            weight: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          min="40"
                          max="150"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-400 text-sm mb-2">School Attended</label>
                        <input
                          type="text"
                          value={playerProfile.school}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            school: e.target.value
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          disabled={isLoading}
                          placeholder="Enter your school name"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={playerProfile.dob}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            dob: e.target.value
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Primary Role</label>
                        <select
                          value={playerProfile.role}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            role: e.target.value
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          disabled={isLoading}
                        >
                          <option value="Batter">Batter</option>
                          <option value="Bowler">Bowler</option>
                          <option value="All-Rounder">All-Rounder</option>
                          <option value="Wicket-Keeper">Wicket-Keeper</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Preferred Format</label>
                        <select
                          value={playerProfile.preferredFormat}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            preferredFormat: e.target.value
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          disabled={isLoading}
                        >
                          <option value="Test">Test</option>
                          <option value="ODI">ODI</option>
                          <option value="T20">T20</option>
                          <option value="All Formats">All Formats</option>
                        </select>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Career Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Matches</label>
                        <input
                          type="number"
                          value={playerProfile.matches || 0}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            matches: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Runs</label>
                        <input
                          type="number"
                          value={playerProfile.runs || 0}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            runs: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Highest Score</label>
                        <input
                          type="number"
                          value={playerProfile.highest_score || 0}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            highest_score: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Batting SR</label>
                        <input
                          type="number"
                          step="0.01"
                          value={playerProfile.batting_strike_rate || ''}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            batting_strike_rate: parseFloat(e.target.value) || undefined
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Wickets</label>
                        <input
                          type="number"
                          value={playerProfile.wickets || 0}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            wickets: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Best Bowling</label>
                        <input
                          type="text"
                          value={playerProfile.best_bowling || ''}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            best_bowling: e.target.value
                          })}
                          placeholder="e.g., 5/30"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Economy</label>
                        <input
                          type="number"
                          step="0.01"
                          value={playerProfile.bowling_economy || ''}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            bowling_economy: parseFloat(e.target.value) || undefined
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Fifties</label>
                        <input
                          type="number"
                          value={playerProfile.fifties || 0}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            fifties: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Hundreds</label>
                        <input
                          type="number"
                          value={playerProfile.hundreds || 0}
                          onChange={(e) => setPlayerProfile({
                            ...playerProfile,
                            hundreds: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="submit"
                        className="bg-green-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        disabled={isLoading || uploading}
                      >
                        {isLoading ? "Updating..." : "Update Profile"}
                      </button>
                      <p className="text-sm text-gray-400">
                        Your profile will be visible to sponsors and selectors
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              <div className="mt-8 bg-gray-900 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-yellow-400">Important Notes</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Your profile is now visible to national selectors and sponsors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>You are eligible for national tournaments and training camps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Sponsorship applications are reviewed within 7-14 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Keep your profile updated with latest performance statistics</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {isRegistered && selectionStatus.district === "REGISTERED" && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl"></div>
                <div>
                  <h3 className="text-xl font-bold text-blue-300">Registration Successful!</h3>
                  <p className="text-gray-300">
                    You are registered for {formData.district} district selection in the {formData.gender === 'male' ? 'Boys' : 'Girls'} category.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold">Next Steps</h4>
                  <p className="text-sm text-gray-300 mt-2">
                    District selection results will be announced within 2 weeks
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold">Check Status</h4>
                  <p className="text-sm text-gray-300 mt-2">
                    Refresh this page to see updated selection status
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold">Contact</h4>
                  <p className="text-sm text-gray-300 mt-2">
                    Email: selections@cricket.lk for inquiries
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-gray-400">
            <p className="mb-2">Working together with Sri Lanka Cricket</p>
            <p className="mb-4">© 2025 Path of Cricket & Talent Portal. All rights reserved.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <input
                type="email"
                placeholder="Email for updates"
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white w-64"
              />
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}