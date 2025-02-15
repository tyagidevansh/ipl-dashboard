"use client";
import { useEffect, useState } from "react";
import { Users, DollarSign, ArrowLeftSquare, Target, Shield, Swords } from "lucide-react";
import { MdSportsCricket } from "react-icons/md";
import { BiSolidCricketBall } from "react-icons/bi";
import { GiCricketBat } from "react-icons/gi";
import { GiGloves } from "react-icons/gi";
import { FaRupeeSign } from "react-icons/fa";

interface Team {
  team: string;
  totalPlayers: {
    indians: number;
    foreigners: number;
  };
  purseRemaining: number;
  roleCounts: {
    batsmen: number;
    bowlers: number;
    wicketkeepers: number;
    allRounders: number;
  };
}

export default function TeamStats() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("http://localhost:3000/api/teams");
        if (!response.ok) throw new Error("Failed to fetch team data");
        const data = await response.json();
        setTeams(data.teams);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  if (loading) return <div className="text-center text-gray-500">Loading teams...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-full overflow-y-auto bg-transparent p-2">
      <div className="grid grid-cols-1 gap-3">
        {teams.map((team) => (
          <div
            key={team.team}
            className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-lg p-1 hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 min-w-fit">
                <div className="w-10 h-10 bg-blue-700 rounded-full overflow-hidden">
                  <img
                    src={`/team-logos/${team.team}outline.avif`}
                    alt={`${team.team} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-white font-bold text-base min-w-10">{team.team}</span>
              </div>

              <div className="flex items-center gap-4 flex-grow">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-300" />
                  <div className="text-base">
                    <span className="text-white">{team.totalPlayers.indians}</span>
                    <span className="text-blue-300">/7</span>
                    <span className="mx-1 text-blue-300">|</span>
                    <span className="text-white">{team.totalPlayers.foreigners}</span>
                    <span className="text-blue-300">/4</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <FaRupeeSign className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-bold">
                    {team.purseRemaining} <span className="text-xs">CR</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-center gap-1">
                    <GiCricketBat className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-white">{team.roleCounts.batsmen}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BiSolidCricketBall className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-white">{team.roleCounts.bowlers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GiGloves className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-white">{team.roleCounts.wicketkeepers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdSportsCricket className="w-5 h-5 text-blue-300" />
                    <span className="text-sm text-white">{team.roleCounts.allRounders}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}