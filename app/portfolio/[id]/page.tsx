// app/profile/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { playerApi, type Player } from '@/utils/api';
import { ArrowLeft, User, Activity } from 'lucide-react';
import Header from '../../components/Header';

// Placeholder image
const placeholderImage = '/placeholder-player.jpg';

export default function PlayerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const data = await playerApi.getPlayerById(id as string);
        if (data) {
          setPlayer(data);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        setError('Failed to load player data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeholderImage;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading player profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !player) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-400 mb-6">{error || 'Player not found'}</p>
            <button
              onClick={() => router.back()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  const genderColors = player.gender === 'Boy'
    ? { primary: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-500' }
    : { primary: 'text-pink-400', bg: 'bg-pink-900/30', border: 'border-pink-500' };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-24">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition mb-6"
          >
            <ArrowLeft size={20} />
            Back to Portfolio
          </button>

          
          <div className="bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
             
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg">
                <img
                  src={player.image_url || placeholderImage}
                  alt={player.name}
                  className="object-cover w-full h-full"
                  onError={handleImageError}
                />
              </div>

              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-yellow-400 mb-2">{player.name}</h1>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${genderColors.bg} ${genderColors.primary}`}>
                    {player.gender}
                  </span>
                  {player.role && (
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                      {player.role}
                    </span>
                  )}
                </div>

               
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {player.age && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 text-sm">Age</div>
                      <div className="text-xl font-bold text-yellow-400">{player.age}</div>
                    </div>
                  )}
                  {player.team && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 text-sm">Team</div>
                      <div className="text-xl font-bold text-yellow-400">{player.team}</div>
                    </div>
                  )}
                  {player.ranking && (
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-gray-400 text-sm">Ranking</div>
                      <div className="text-xl font-bold text-yellow-400">{player.ranking}</div>
                    </div>
                  )}
                </div>

                
                {player.description && (
                  <div className="bg-gray-700/30 p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-gray-300 italic">{player.description}</p>
                  </div>
                )}
              </div>
            </div>

          
            {player.stats && player.stats.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Career Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {player.stats.map((stat, index) => (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-400">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

       
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/portfolio')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-lg transition flex items-center gap-2"
            >
              <User size={20} />
              Browse More Players
            </button>
          </div>
        </div>
      </main>
    </>
  );
}