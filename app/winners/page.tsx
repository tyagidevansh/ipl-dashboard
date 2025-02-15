"use client"
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PlayerData {
  _id: string;
  player: string;
  total_impact: number;
  impactPerMatch: number;
  imagePath: string;
  battingStyle: string;
  bowlingStyle: string;
  role: string;
  matches: number;
  runs: number;
  wickets: number;
  team: string;
  isSold?: boolean;
  soldTo?: string;
  sellingPrice?: number;
}

interface TeamData {
  team: string;
  totalImpact: number;
  players: PlayerData[];
}

const WinnersShowcase = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWinners() {
      try {
        const response = await fetch("/api/winners");
        if (!response.ok) {
          throw new Error("Failed to fetch team rankings.");
        }
        const data = await response.json();
        setTeams(data.winners);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchWinners();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  if (error) return (
    <div className="text-center p-6 bg-red-100 rounded-lg text-red-700 mt-10">
      <p className="font-semibold">Error loading teams</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">🏆 IPL Auction Results</h2>
        <p className="text-gray-400">Team rankings based on total impact scores</p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, index) => (
          <div
            key={team.team}
            onClick={() => setSelectedTeam(team)}
            className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 cursor-pointer 
                     hover:scale-102 transition-all duration-300 border border-gray-700 hover:border-purple-500"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
              {index + 1}
            </div>
            
            <div className="flex items-center space-x-4">
              <img
                src={`/team-logos/${team.team.toLowerCase()}outline.avif`}
                alt={`${team.team} logo`}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {team.team}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-gray-400 text-sm">Total Impact:</span>
                  <span className="ml-2 text-purple-400 font-bold">{team.totalImpact.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Player Details Modal */}
      {selectedTeam && (
        <Dialog open={Boolean(selectedTeam)} onOpenChange={() => setSelectedTeam(null)}>
          <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-4xl">
            <DialogHeader>
              <div className="flex items-center space-x-4">
                <img
                  src={`/team-logos/${selectedTeam.team.toLowerCase()}outline.avif`}
                  alt={`${selectedTeam.team} logo`}
                  className="w-12 h-12 object-contain"
                />
                <DialogTitle className="text-2xl font-bold">{selectedTeam.team} Squad</DialogTitle>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {selectedTeam.players.map((player) => (
                <div key={player._id} 
                     className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
                  <div className="relative pb-[75%]">
                    <img
                      src={player.imagePath}
                      alt={player.player}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold truncate">{player.player}</h4>
                    <p className="text-sm text-purple-400 mb-2">{player.role}</p>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>Matches: {player.matches}</p>
                      <p>Runs: {player.runs}</p>
                      {player.wickets > 0 && <p>Wickets: {player.wickets}</p>}
                      <p className="text-purple-400 font-medium mt-2">
                        Impact Score: {player.impactPerMatch.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setSelectedTeam(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WinnersShowcase;