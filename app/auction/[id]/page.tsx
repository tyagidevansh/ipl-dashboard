"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { User, ChartNoAxesCombined, Calendar, Trophy, PersonStanding, Medal, ChevronRight, Gavel, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import TeamStats from "@/components/teamInfo";
import { BsAirplane } from "react-icons/bs";

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
  foreigner?: boolean;
}

export default function PlayerPage() {
  const [players, setPlayers] = useState<Array<PlayerData>>([]);
  const [player, setPlayer] = useState<PlayerData>();
  const [sellingPrice, setSellingPrice] = useState("");
  const [soldTo, setSoldTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("/api/indians");
        const data = await response.json();
        setPlayers(data.data); 
  
        const foreigners = await fetch("/api/foreigners");
        const fdata = await foreigners.json();

        const foreignPlayers: PlayerData[] = Array.isArray(fdata.data) ? fdata.data : [];

        foreignPlayers.forEach((f) => {
          f.foreigner = true;
        });
  
        setPlayers((prevPlayers) => [...prevPlayers, ...foreignPlayers]);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
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

  const handleSellPlayer = async () => {
    if (!sellingPrice || !soldTo) {
      setError("Both fields are required.");
      return;
    }

    if (!player) {
      setError("Player data is not available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(player.foreigner ? "/api/foreigners" : "/api/indians", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: player.player,
          soldTo,
          sellingPrice: parseFloat(sellingPrice),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update player.");
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/auction/${parseInt(id as string) + 1}`);
      }, 5000);

    } catch (err) {
      console.log(err);
      setError("Failed to sell player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-purple-800 text-white">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-700">
          <Alert className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-none text-white backdrop-blur-sm shadow-lg">
            <CheckCircle2 className="h-6 w-6" />
            <AlertTitle className="text-lg font-bold">Sale Successful!</AlertTitle>
            <AlertDescription className="text-base">
              {player.player} has been sold to {soldTo} for {sellingPrice} CR
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="flex">
        <div className="w-3/5 pr-10 px-12 py-12">
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
                  <span className="ml-5">{player.foreigner && <BsAirplane/>}</span>
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
                      <p className="text-xl font-semibold text-white">{player.role}</p>
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
                      <p className="text-xl font-semibold text-white">{player.matches}</p>
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
                      <p className="text-xl font-semibold text-white">{player.runs}</p>
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
                      <p className="text-xl font-semibold text-white">{player.wickets}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          
          <div className="flex w-1/2 justify-between items-center mt-8">
            <Popover>
              <PopoverTrigger>
                <Button className="px-8 py-4 w-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2">
                  Sell Player
                  <Gavel className="w-5 h-5" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-96 bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-lg shadow-xl p-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 border-b border-purple-500/30 pb-4">
                    <Gavel className="w-6 h-6 text-yellow-400" />
                    <h4 className="text-xl font-semibold text-white">Sell Player</h4>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-purple-200">Selling Price</Label>
                      <div className="flex items-center bg-white/10 rounded-lg border border-purple-500/30 focus-within:border-yellow-400/50 transition-colors">
                        <Input
                          id="price"
                          type="number"
                          className="h-10 flex-grow border-none bg-transparent text-white placeholder:text-purple-300"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                        />
                        <span className="mr-3 text-purple-300">CR</span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="team" className="text-purple-200">Team</Label>
                      <Input
                        id="team"
                        className="h-10 bg-white/10 rounded-lg border border-purple-500/30 focus:border-yellow-400/50 transition-colors text-white placeholder:text-purple-300"
                        value={soldTo}
                        onChange={(e) => setSoldTo(e.target.value)}
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/30">
                        {error}
                      </p>
                    )}

                    <div>
                      <Button
                        className="mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
                        onClick={handleSellPlayer}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          "Confirm Sale"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={() => router.push(`/auction/${parseInt(id as string) + 1}`)}
              className="w-48 ml-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Next Player
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        <div className="w-2/5 py-8 px-8">
          <TeamStats />
        </div>
      </div>
    </div>
  );
}