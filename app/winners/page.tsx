"use client"
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trophy, Star, Medal } from "lucide-react";

interface PlayerData {
  _id: string;
  player: string;
  impactPerMatch: number;
  imagePath: string;
  role: string;
}

interface TeamData {
  team: string;
  totalImpact: number;
  players: PlayerData[];
}

const WinnersReveal = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const positionColors: Record<number, string> = {
    0: "from-blue-400 to-blue-500",
    1: "from-amber-600 to-amber-700",
    2: "from-slate-300 to-slate-400",
    3: "from-yellow-400 to-yellow-600"
  };

  useEffect(() => {
    async function fetchWinners() {
      try {
        const response = await fetch("/api/winners");
        if (!response.ok) throw new Error("Failed to fetch winners");
        const data = await response.json();
        setTeams(data.winners.slice(0, 4).reverse());
        setTimeout(() => setShowIntro(false), 3500);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchWinners();
  }, []);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="text-center text-red-400 bg-gray-800/50 p-8 rounded-lg backdrop-blur-sm">
        <p className="text-xl font-bold">Error loading results</p>
        <p>{error}</p>
      </div>
    </div>
  );

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-800 to-gray-900 overflow-hidden">
        <div className="relative">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 300 - 150}px`,
                left: `${Math.random() * 300 - 150}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <Star className="w-4 h-4 text-yellow-400/30" />
            </div>
          ))}

          <div className="relative z-10 text-center">
            <div className="relative">
              <Trophy className="w-32 h-32 mx-auto mb-8 text-yellow-400 animate-bounce" />
              <div className="absolute inset-0 animate-pulse">
                <Trophy className="w-32 h-32 mx-auto text-yellow-400/20 blur-lg" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-4 animate-pulse">
              The Winners Are...
            </h1>
            
            <div className="w-32 h-1 mx-auto bg-gradient-to-r from-blue-500 to-pink-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-7xl">
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full 
                   text-white hover:bg-white/20 transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full 
                   text-white hover:bg-white/20 transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="overflow-hidden rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-white/10">
          <div 
            className="transition-transform duration-500 ease-out flex"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {teams.map((team, index) => (
              <div key={team.team} className="w-full flex-shrink-0">
                <div className="p-6">
                  <div className="text-center mb-6 relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${positionColors[index]} opacity-5 blur-3xl -z-10`} />
                    
                    <div className="relative inline-block">
                      <div className="relative">
                        <img
                          src={`/team-logos/${team.team.toUpperCase()}outline.avif`}
                          alt={`${team.team} logo`}
                          className="w-32 h-32 object-contain mx-auto drop-shadow-xl"
                        />
                        <div className={`absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br ${positionColors[index]}
                                    rounded-full flex items-center justify-center text-white text-xl font-bold
                                    border-2 border-gray-900 shadow-lg`}>
                          #{4 - index}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-white text-2xl font-bold">{team.team}</p>
                        <p className="text-blue-300 text-sm">Impact Score: {team.totalImpact.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-11 gap-2 px-4">
                    {[...team.players]
                      .sort((a, b) => b.impactPerMatch - a.impactPerMatch)
                      .slice(0, 11)
                      .map((player, playerIndex) => (
                        <div 
                          key={player._id}
                          className="text-center group relative"
                        >
                          <div className="relative transform group-hover:scale-110 transition-all duration-300">
                            <div className="w-full pb-[100%] relative overflow-hidden rounded-full">
                              <img
                                src={player.imagePath}
                                alt={player.player}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className={`absolute inset-0 rounded-full ring-2 ${
                              playerIndex === 0 ? 'ring-yellow-400' : 'ring-blue-400/40'
                            } ring-offset-1 ring-offset-gray-900`} />
                            {playerIndex === 0 && (
                              <Medal className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="mt-1 transform transition-all duration-300">
                            <h3 className="text-white text-xs font-medium truncate px-1">
                              {player.player}
                            </h3>
                            <p className="text-blue-300 text-xs">
                              {player.impactPerMatch.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-blue-400 w-4' 
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnersReveal;