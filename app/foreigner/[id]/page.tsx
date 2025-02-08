"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, ChartNoAxesCombined, Calendar, Trophy, PersonStanding, Medal, ChevronRight, Gavel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

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
}

export default function PlayerPage() {
  const [players, setPlayers] = useState<Array<PlayerData>>([]);
  const [player, setPlayer] = useState<PlayerData>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchPlayers() {
      const response = await fetch("/api/foreigners");
      const data = await response.json();
      setPlayers(data.data);
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      const playerIndex = parseInt(id as string) - 1;
      if (playerIndex >= 0 && playerIndex < players.length) {
        setPlayer(players[playerIndex]);
      } else {
        setPlayer(undefined);
      }
    }
  }, [players, id]);

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex">
          <div className="w-2/3 pr-8">
            <div className="flex items-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 border-8 border-yellow-400/30 rounded-lg transform -rotate-3"></div>
                <div className="absolute inset-0 border-8 border-purple-400/30 rounded-lg transform rotate-3"></div>
                <Card className="relative bg-white/10 backdrop-blur-sm border-2 border-purple-500/30 rounded-lg overflow-hidden w-64">
                  <CardContent className="p-0">
                    <img
                      src={player.imagePath}
                      alt={player.player}
                      className="w-64 h-64 object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="ml-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                  {player.player}
                </h1>
                <div className="flex items-center mt-4 text-yellow-400">
                  <Trophy className="w-5 h-5 mr-2" />
                  <span className="text-xl">{player.team}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <User className="w-8 h-8 text-yellow-400 mr-4" />
                    <div>
                      <p className="text-sm text-purple-200">Role</p>
                      <p className="text-xl font-semibold">{player.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-yellow-400 mr-4" />
                    <div>
                      <p className="text-sm text-purple-200">Matches</p>
                      <p className="text-xl font-semibold">{player.matches}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <PersonStanding className="w-8 h-8 text-yellow-400 mr-4" />
                    <div>
                      <p className="text-sm text-purple-200">Runs</p>
                      <p className="text-xl font-semibold">{player.runs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ChartNoAxesCombined className="w-8 h-8 text-yellow-400 mr-4" />
                    <div>
                      <p className="text-sm text-purple-200">Wickets</p>
                      <p className="text-xl font-semibold">{player.wickets}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex w-1/2 justify-between items-center mt-8">
              <Popover>
                <PopoverTrigger>
                  <Button
                    onClick={() => setOpenModal(true)}
                    className="px-8 py-4 w-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Sell Player
                    <Gavel className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-96 bg-white/30 backdrop-blur-md border border-white/20 rounded-lg shadow-lg p-4">
                  <div className="grid gap-4">
                    <h4 className="text-xl font-semibold text-gray-900">Sell Player</h4>

                    <div className="grid gap-3">
                      <div className="grid grid-cols-3 items-center gap-3">
                        <Label htmlFor="price" className="text-gray-700">Selling Price</Label>
                        <div className="col-span-2 flex items-center bg-gray-100 px-2 rounded-lg">
                          <Input id="maxWidth" className="h-10 flex-grow border-none bg-transparent" />
                          <span className="ml-2 text-gray-500">CR</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-center gap-3">
                        <Label htmlFor="team" className="text-gray-700">Team</Label>
                        <Input id="team" className="col-span-2 h-10 bg-gray-100 px-2 rounded-lg border-none" />
                      </div>

                      <Button className="w-full mt-4 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition">
                        Done
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => router.push(`/indian/${parseInt(id as string) + 1}`)}
                className="w-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Next Player
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

          </div>

          <div className="w-1/3">
            {/* team budgets*/}
          </div>
        </div>
      </div>
    </div>
  );
}