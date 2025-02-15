"use client"
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trophy, Star } from "lucide-react";

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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 200 - 100}px`,
                left: `${Math.random() * 200 - 100}px`,
                animationDelay: `${Math.random() * 2}s`,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-600 to-gray-900 flex items-center justify-center p-2">
      <div className="relative w-full max-w-7xl">
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full 
                   text-white hover:bg-white/20 transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full 
                   text-white hover:bg-white/20 transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="overflow-hidden rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-white/10">
          <div 
            className="transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            <div className="flex">
              {teams.map((team, index) => (
                <div key={team.team} className="w-full flex-shrink-0">
                  <div className="p-8">
                    <div className="text-center mb-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl -z-10" />
                      
                      <div className="relative inline-block mb-0">
                        <img
                          src={`/team-logos/${team.team.toLowerCase()}outline.avif`}
                          alt={`${team.team} logo`}
                          className="w-40 h-40 object-contain mx-auto drop-shadow-xl"
                        />
                        <div className="absolute -top-0 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 
                                    rounded-full flex items-center justify-center text-white text-2xl font-bold
                                    border-4 border-gray-900">
                          #{4 - index}
                        </div>
                      </div>
                      
                      {/* <p className="text-blue-300 text-lg font-bold">Impact Score: {team.totalImpact.toFixed(1)}</p> */}
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 px-4">
                      {[...team.players]
                        .sort((a, b) => b.impactPerMatch - a.impactPerMatch)
                        .slice(0, 11)
                        .map((player, playerIndex) => (
                          <div 
                            key={player._id}
                            className="text-center group"
                          >
                            <div className="relative mb-3 transform group-hover:scale-110 transition-transform duration-300">
                              <div className="w-full pb-[100%] relative overflow-hidden rounded-full">
                                <img
                                  src={player.imagePath}
                                  alt={player.player}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute inset-0 rounded-full ring-2 ring-yellow-400/80 ring-offset-2 ring-offset-gray-900" />
                            </div>
                            <h3 className="text-white text-sm font-medium truncate px-1">
                              {player.player}
                            </h3>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6 space-x-3">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-blue-600' 
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