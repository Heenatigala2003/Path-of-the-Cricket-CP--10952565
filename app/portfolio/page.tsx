// app/portfolio/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import { Search, Video, Star, PlayCircle, ExternalLink, ArrowRight, User, Loader2, Calendar, Users, RefreshCw } from "lucide-react";
import { 
  getPlayers, 
  playerApi, 
  highlightsApi, 
  talentsApi,
  mockAllPlayers,
  mockFeaturedBoys,
  mockFeaturedGirls,
  mockHighlights,
  mockTalents,
  type Player,
  type Highlight,
  type Talent 
} from "@/utils/api";


const placeholderImages = {
  player: "/playerB2.jpg",
  highlight: "/placeholder-highlight.jpg",
  talent: "/placeholder-talent.jpg",
  default: "/default-image.png"
};

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'highlights' | 'talents'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [filterYear, setFilterYear] = useState('all');
  const [highlightSearch, setHighlightSearch] = useState('');
  

  const [allPlayers, setAllPlayers] = useState<Player[]>(mockAllPlayers);
  const [featuredBoys, setFeaturedBoys] = useState<Player[]>(mockFeaturedBoys);
  const [featuredGirls, setFeaturedGirls] = useState<Player[]>(mockFeaturedGirls);
  const [highlights, setHighlights] = useState<Highlight[]>(mockHighlights);
  const [talents, setTalents] = useState<Talent[]>(mockTalents);
  const [filteredHighlights, setFilteredHighlights] = useState<Highlight[]>(mockHighlights);
  

  const [loading, setLoading] = useState({
    players: false,
    highlights: false,
    talents: false,
    search: false,
    initial: false
  });
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState({
    players: true,
    highlights: true,
    talents: true
  });


  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setError(null);
      

      try {
        setLoading(prev => ({ ...prev, players: true }));
        const playersData = await getPlayers();
        
        if (playersData && playersData.length > 0) {
          setAllPlayers(playersData);
          

          const featuredBoysData = await playerApi.getFeaturedPlayers('Boy', 3);
          if (featuredBoysData && featuredBoysData.length > 0) {
            setFeaturedBoys(featuredBoysData);
          }
          

          const featuredGirlsData = await playerApi.getFeaturedPlayers('Girl', 3);
          if (featuredGirlsData && featuredGirlsData.length > 0) {
            setFeaturedGirls(featuredGirlsData);
          }
          
          setUsingMockData(prev => ({ ...prev, players: false }));
        } else {

          setUsingMockData(prev => ({ ...prev, players: true }));
        }
      } catch (dbError) {
        console.log("Using mock players data:", dbError);
        setUsingMockData(prev => ({ ...prev, players: true }));
      } finally {
        setLoading(prev => ({ ...prev, players: false }));
      }
      

      try {
        setLoading(prev => ({ ...prev, highlights: true }));
        const highlightsData = await highlightsApi.getAllHighlights();
        
        if (highlightsData && highlightsData.length > 0) {
          setHighlights(highlightsData);
          setFilteredHighlights(highlightsData);
          setUsingMockData(prev => ({ ...prev, highlights: false }));
        } else {
          setUsingMockData(prev => ({ ...prev, highlights: true }));
        }
      } catch (dbError) {
        console.log("Using mock highlights data:", dbError);
        setUsingMockData(prev => ({ ...prev, highlights: true }));
      } finally {
        setLoading(prev => ({ ...prev, highlights: false }));
      }
      

      try {
        setLoading(prev => ({ ...prev, talents: true }));
        const talentsData = await talentsApi.getAllTalents(8);
        
        if (talentsData && talentsData.length > 0) {
          setTalents(talentsData);
          setUsingMockData(prev => ({ ...prev, talents: false }));
        } else {
          setUsingMockData(prev => ({ ...prev, talents: true }));
        }
      } catch (dbError) {
        console.log("Using mock talents data:", dbError);
        setUsingMockData(prev => ({ ...prev, talents: true }));
      } finally {
        setLoading(prev => ({ ...prev, talents: false }));
      }
      
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Initial fetch error:', err);
    }
  };


  const handlePlayerSearch = async () => {
    if (!searchQuery.trim()) {
  
      setSearchResults(allPlayers);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, search: true }));
      setError(null);
      
      const results = await playerApi.searchPlayers(searchQuery);
      setSearchResults(results);
      
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };


  useEffect(() => {
    const filterHighlights = () => {
      let filtered = [...highlights];
      
      
      if (filterYear !== 'all') {
        filtered = filtered.filter(h => h.year === filterYear);
      }
      

      if (highlightSearch.trim()) {
        const query = highlightSearch.toLowerCase();
        filtered = filtered.filter(h =>
          h.title.toLowerCase().includes(query) ||
          h.description?.toLowerCase().includes(query)
        );
      }
      
      setFilteredHighlights(filtered);
    };

    filterHighlights();
  }, [highlightSearch, filterYear, highlights]);

 
  const getUniqueYears = () => {
    const yearsSet = new Set(highlights.map(h => h.year));
    return ['all', ...Array.from(yearsSet).sort((a, b) => b.localeCompare(a))];
  };


  useEffect(() => {
    if (activeTab === 'profile') {
      setSearchResults(allPlayers);
    }
  }, [activeTab, allPlayers]);

  const tabs = [
    { id: 'profile', label: 'PLAYER SEARCH PORTAL', icon: <Search className="w-4 h-4" /> },
    { id: 'highlights', label: 'MATCH HIGHLIGHTS & ARCHIVE', icon: <Video className="w-4 h-4" /> },
    { id: 'talents', label: 'UPCOMING TALENTS', icon: <Star className="w-4 h-4" /> },
  ];


  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, type: 'player' | 'highlight' | 'talent' = 'player') => {
    const target = e.currentTarget;
    switch (type) {
      case 'player':
        target.src = placeholderImages.player;
        break;
      case 'highlight':
        target.src = placeholderImages.highlight;
        break;
      case 'talent':
        target.src = placeholderImages.talent;
        break;
      default:
        target.src = placeholderImages.default;
    }
    target.onerror = null;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-24">
    
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="relative w-30 h-30 rounded-full  border-yellow-900 overflow-hidden">
            <Image
              src="/image55.png"
              alt="Cricket bat and ball icon"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 uppercase tracking-wider">
            PATH OF THE CRICKET
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Explore Player Talent & Performance
            </h2>
            <button
              onClick={fetchAllData}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </div>


          <div className="mb-6 flex flex-wrap gap-2">
            {usingMockData.players && (
              <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-sm">
                Using Sample Players Data
              </span>
            )}
            {usingMockData.highlights && (
              <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-sm">
                Using Sample Highlights
              </span>
            )}
            {usingMockData.talents && (
              <span className="px-3 py-1 bg-yellow-900/50 text-yellow-400 rounded-full text-sm">
                Using Sample Talents
              </span>
            )}
            {!usingMockData.players && !usingMockData.highlights && !usingMockData.talents && (
              <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm">
                Live Database Connected
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 text-red-400 hover:text-red-300 underline text-sm"
              >
                Refresh Page
              </button>
            </div>
          )}

          
          <div className="flex flex-wrap justify-center border-b border-gray-800 mb-8 gap-4 md:gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 font-semibold uppercase tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-yellow-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

         
          <div className="min-h-[600px]">
          
            {activeTab === 'profile' && (
              <div className="space-y-12">

                <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePlayerSearch()}
                    placeholder="Search player by name, role, team, or description"
                    className="flex-1 w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handlePlayerSearch}
                    disabled={loading.search}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.search ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    {loading.search ? 'Searching...' : 'Search Players'}
                  </button>
                </div>

      
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">
                    {searchQuery ? 'Search Results' : 'All Players in Database'}
                  </h3>
                  
                  {loading.search || loading.players ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
                      <p className="text-gray-400">Loading players...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {(searchResults.length > 0 ? searchResults : allPlayers).map((player) => {
                        const gender = player.gender === 'Boy' ? 'boy' : 'girl';
                        return (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            gender={gender}
                            onImageError={handleImageError}
                          />
                        );
                      })}
                      
                      {(searchResults.length === 0 && allPlayers.length === 0) && (
                        <p className="text-gray-400 italic py-8 col-span-full text-center">
                          No players found in database.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400">Total Players in Database</h3>
                      <p className="text-gray-400">Browse all registered cricket players</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400">{allPlayers.length}</div>
                      <p className="text-gray-500 text-sm">Players</p>
                    </div>
                  </div>
                </div>

       
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-500 text-sm uppercase tracking-widest">
                    BOYS DIVISION
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-8">FEATURED TOP BOYS PROFILES</h3>
                  
                  {loading.players ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
                      <p className="text-gray-400">Loading featured boys...</p>
                    </div>
                  ) : featuredBoys.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {featuredBoys.map((player, index) => (
                        <PlayerCard 
                          key={player.id} 
                          player={player} 
                          rank={index + 1}
                          gender="boy" 
                          onImageError={handleImageError}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                      <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-400 mb-2">No Featured Boys</h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No featured boys players available.
                      </p>
                    </div>
                  )}
                </div>

              
                <div className="relative mt-16">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-pink-500 text-sm uppercase tracking-widest">
                    GIRLS DIVISION
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-8">FEATURED TOP GIRLS PROFILES</h3>
                  
                  {loading.players ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
                      <p className="text-gray-400">Loading featured girls...</p>
                    </div>
                  ) : featuredGirls.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {featuredGirls.map((player, index) => (
                        <PlayerCard 
                          key={player.id} 
                          player={player} 
                          rank={index + 1}
                          gender="girl" 
                          onImageError={handleImageError}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                      <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-400 mb-2">No Featured Girls</h4>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No featured girls players available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {activeTab === 'highlights' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-bold text-yellow-400 text-center mb-8">
                  CRITICAL MATCH MOMENTS
                </h3>

             
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <input
                      type="text"
                      value={highlightSearch}
                      onChange={(e) => setHighlightSearch(e.target.value)}
                      placeholder="Search by match name or description"
                      className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {getUniqueYears().map(year => (
                        <option key={year} value={year}>
                          {year === 'all' ? 'All Years' : year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setHighlightSearch('');
                      setFilterYear('all');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition"
                  >
                    Clear Filters
                  </button>
                </div>

  
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-yellow-500" />
                      <span className="text-gray-400">Total Highlights:</span>
                      <span className="text-yellow-400 font-bold">{filteredHighlights.length}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filterYear === 'all' 
                        ? 'Showing all highlights' 
                        : `Filtered by: ${filterYear}`}
                      {highlightSearch && `, Search: "${highlightSearch}"`}
                    </div>
                  </div>
                </div>


                {loading.highlights ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
                    <p className="text-gray-400">Loading highlights...</p>
                  </div>
                ) : filteredHighlights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filteredHighlights.map((highlight) => (
                      <div key={highlight.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                        <div className="relative h-48 w-full">
                          <img
                            src={highlight.image_url || placeholderImages.highlight}
                            alt={highlight.title}
                            width={400}
                            height={192}
                            className="object-cover w-full h-full border-b-4 border-yellow-500"
                            onError={(e) => handleImageError(e, 'highlight')}
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-bold text-yellow-400">{highlight.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {highlight.year}
                            </div>
                          </div>
                          <p className="text-gray-400 mb-4 line-clamp-2">{highlight.description}</p>
                          {highlight.video_url && (
                            <a
                              href={highlight.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 font-semibold flex items-center gap-2 hover:text-green-300 transition"
                            >
                              <PlayCircle className="w-5 h-5" />
                              Watch Video
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-400 mb-2">No Highlights Found</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {highlightSearch || filterYear !== 'all' 
                        ? 'No highlights match your search criteria. Try changing your filters.' 
                        : 'No highlights available.'}
                    </p>
                  </div>
                )}
              </div>
            )}

    
            {activeTab === 'talents' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-bold text-yellow-400 text-center">
                  FUTURE STARS SHOWCASE
                </h3>

        
                {loading.talents ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
                    <p className="text-gray-400">Loading upcoming talents...</p>
                  </div>
                ) : talents.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                      {talents.map((talent) => (
                        <div key={talent.id} className="bg-gray-800 rounded-xl p-6 text-center shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-700 hover:border-yellow-500">
                          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-yellow-500">
                            <img
                              src={talent.image_url || placeholderImages.talent}
                              alt={talent.name}
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                              onError={(e) => handleImageError(e, 'talent')}
                            />
                          </div>
                          <h4 className="text-lg font-bold mb-1">{talent.name}</h4>
                          <p className="text-gray-400 text-sm mb-3">{talent.role}</p>
                          {talent.bio && (
                            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{talent.bio}</p>
                          )}
                          <button className="text-yellow-400 text-sm font-medium flex items-center justify-center gap-1 hover:text-yellow-300 transition">
                            View Profile
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>


                    <div className="text-center pt-8">
                      <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase px-8 py-3 rounded-lg transition flex items-center gap-2 mx-auto">
                        View All Upcoming Talents
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-400 mb-2">No Upcoming Talents</h4>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No upcoming talents available.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>


      <footer className="bg-black text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-sm">
            © 2025 Path of Cricket. All rights reserved. | Powered by Supabase
          </p>
        </div>
      </footer>
    </>
  );
}


function PlayerCard({ 
  player, 
  rank, 
  gender,
  onImageError 
}: { 
  player: Player; 
  rank?: number; 
  gender: 'boy' | 'girl';
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>, type: 'player' | 'highlight' | 'talent') => void;
}) {
  const borderColor = gender === 'boy' ? 'border-yellow-500 hover:border-yellow-400' : 'border-pink-500 hover:border-pink-400';
  const badgeColor = gender === 'boy' ? 'bg-yellow-500' : 'bg-pink-500';
  const textColor = gender === 'boy' ? 'text-yellow-500' : 'text-pink-500';

  return (
    <div className={`bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-2 transition-all relative ${borderColor}`}>
   
      {rank && (
        <div className={`${badgeColor} text-black font-bold absolute -top-2 -right-2 px-4 py-1 rounded-bl-xl z-10`}>
          #{rank}
        </div>
      )}

     
      <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-700">
        <div className={`relative w-20 h-20 rounded-full overflow-hidden border-4 ${gender === 'boy' ? 'border-green-500' : 'border-pink-500'}`}>
          <img
            src={player.image_url || "/placeholder-player.jpg"}
            alt={player.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            onError={(e) => onImageError(e, 'player')}
          />
        </div>
        <div>
          <h4 className="text-xl font-bold text-yellow-400">{player.name}</h4>
          <p className="text-gray-400 text-sm">{player.role || 'Player'}</p>
          <div className="flex items-center gap-3 mt-1 text-sm">
            {player.age && (
              <span className="text-gray-400">Age: {player.age}</span>
            )}
            {player.team && (
              <span className="text-gray-400">Team: {player.team}</span>
            )}
          </div>
          <p className={`${textColor} font-semibold text-sm mt-1`}>Ranking: {player.ranking}</p>
        </div>
      </div>

    
      {player.description && (
        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
          {player.description}
        </p>
      )}


      {player.stats && player.stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {player.stats.slice(0, 3).map((stat, index) => (
            <div key={index} className="text-center bg-gray-900/50 p-2 rounded">
              <div className="text-lg font-bold text-green-400">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase truncate">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <Link href={`/profile/${player.id}`} className={`w-full ${badgeColor} hover:opacity-90 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2`}>
        <User className="w-5 h-5" />
        View Full Profile
      </Link>
    </div>
  );
}