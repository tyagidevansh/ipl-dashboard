"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Calendar, ChevronRight, Gavel, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TeamStats from "@/components/teamInfo";
import { ImAirplane } from "react-icons/im";
import { GiCricketBat, GiGloves } from "react-icons/gi";
import { BiSolidCricketBall } from "react-icons/bi";
import { MdSportsCricket } from "react-icons/md";

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

const teams = [
  "MI",
  "CSK",
  "RCB",
  "DC",
  "PBKS",
  "RR",
  "LSG",
  "GT",
  "KKR",
  "SRH",
];

export default function PlayerPage() {
  const [players, setPlayers] = useState<Array<PlayerData>>([]);
  const [player, setPlayer] = useState<PlayerData>();
  const [sellingPrice, setSellingPrice] = useState("");
  const [soldTo, setSoldTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    console.log("players fetched");
    async function fetchPlayers() {
      const val = localStorage.getItem("players");
      if (val) {
        const valJSON = JSON.parse(val);
        setPlayers(valJSON);
      } else {
        try {
          const response = await fetch("/api/indians");
          const data = await response.json();
          let indianPlayers: PlayerData[] = Array.isArray(data.data)
            ? data.data
            : [];

          const foreigners = await fetch("/api/foreigners");
          const fdata = await foreigners.json();
          let foreignPlayers: PlayerData[] = Array.isArray(fdata.data)
            ? fdata.data
            : [];

          foreignPlayers = foreignPlayers.map((f) => ({
            ...f,
            foreigner: true,
          }));
          indianPlayers = indianPlayers.filter((p) => !p.isSold);
          foreignPlayers = foreignPlayers.filter((p) => !p.isSold);

          const allPlayers = [...indianPlayers, ...foreignPlayers];
          shuffleArray(allPlayers);
          
          localStorage.setItem("players", JSON.stringify(allPlayers));
          setPlayers(allPlayers);
        } catch (error) {
          console.error("Error fetching players:", error);
        }
      }
    }

    fetchPlayers();
  }, []);

  function shuffleArray(array: PlayerData[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

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
  
    if (!teams.includes(soldTo)) {
      setError("Invalid team selected. Please choose a valid IPL team.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      // Validate the sale before proceeding
      const validationResponse = await fetch("/api/validateSell", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: player.player,
          foreigner: player.foreigner || false,
          soldTo,
          sellingPrice: parseFloat(sellingPrice),
        }),
      });
  
      const validationResult = await validationResponse.json();
      if (!validationResult.valid) {
        throw new Error(validationResult.error || "Sale validation failed.");
      }
  
      // If validation passed, proceed with selling the player
      const sellResponse = await fetch(
        player.foreigner ? "/api/foreigners" : "/api/indians",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: player.player,
            soldTo,
            sellingPrice: parseFloat(sellingPrice),
          }),
        }
      );
  
      const sellResult = await sellResponse.json();
      if (!sellResponse.ok) {
        throw new Error(sellResult.error || "Failed to update player.");
      }
  
      setShowSuccess(true);
      setTimeout(() => {
        router.push(`/auction/${parseInt(id as string) + 1}`);
      }, 3000);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to sell player. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleTeamInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSoldTo(value);

    if (value) {
      const filtered = teams.filter((team) => team.startsWith(value));
      setFilteredTeams(filtered);
      setShowDropdown(true);
      setHighlightedIndex(0);
    } else {
      setShowDropdown(false);
    }
  };

  const selectTeam = (team: string) => {
    setSoldTo(team);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && filteredTeams.length > 0) {
      if (e.key === "ArrowDown") {
        setHighlightedIndex((prev) => (prev + 1) % filteredTeams.length);
      } else if (e.key === "ArrowUp") {
        setHighlightedIndex(
          (prev) => (prev - 1 + filteredTeams.length) % filteredTeams.length
        );
      } else if (e.key === "Enter") {
        selectTeam(filteredTeams[highlightedIndex]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    }
  };
  let i = parseInt(id as string);
  if (Number.isInteger(i) && !player && players.length > 0) {
    if (i > players.length) {
      return (
        <div className="flex flex-col items-center bg-gradient-to-br from-slate-900 to-blue-800 justify-center min-h-screen text-white">
          <h1 className="text-3xl font-bold mb-4">No more players available</h1>
          <p className="mb-3">
            You have reached the end of the list of players.
          </p>
          <p className="mb-8">
            Maybe try going back to see if any players were unsold.
          </p>
          <Button
            onClick={() => {
              localStorage.removeItem("players");
              router.push("/auction/1");
              router.refresh();
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-500 transition-all duration-300"
          >
            Go Back to Start
          </Button>
        </div>
      );
    }
  }

  if (!player) {
    return (
      <div className="flex items-center bg-gradient-to-br from-slate-900 to-blue-800 justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  const roleIcon = () => {
    if (player) {
      if (player.role == "Batsman") {
        return (
          <div className="absolute bottom-0 right-0">
            <GiCricketBat className="text-white w-12 h-12" />
          </div>
        );
      } else if (player.role == "Bowler") {
        return (
          <div className="absolute bottom-0 right-0">
            <BiSolidCricketBall className="text-white w-12 h-12" />
          </div>
        );
      } else if (player.role == "Wicketkeeper") {
        return (
          <div className="absolute bottom-0 right-0">
            <GiGloves className="text-white w-12 h-12" />
          </div>
        );
      } else {
        return (
          <div className="absolute bottom-2 right-2">
            <MdSportsCricket className="text-white w-12 h-12" />
          </div>
        );
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-blue-800 text-white">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-700">
          <Alert className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-none text-white backdrop-blur-sm shadow-lg">
            <CheckCircle2 className="h-6 w-6" />
            <AlertTitle className="text-lg font-bold">
              Sale Successful!
            </AlertTitle>
            <AlertDescription className="text-base">
              {player.player} has been sold to {soldTo} for {sellingPrice} CR
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex">
        <div className="w-3/5 pr-10 px-12 py-12">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 border-8 border-yellow-400/30 rounded-lg transform -rotate-3"></div>
              <div className="absolute inset-0 border-8 border-blue-400/30 rounded-lg transform rotate-3"></div>
              <Card className="relative bg-white/10 backdrop-blur-sm border-2 border-blue-500/30 rounded-lg overflow-hidden w-64 group">
                <CardContent className="p-0">
                  <img
                    src={player.imagePath}
                    alt={player.player}
                    className="w-64 h-64 object-cover"
                  />
                  {player.foreigner && (
                    <div className="absolute bottom-2 left-2">
                      <ImAirplane className="text-white w-10 h-10" />
                    </div>
                  )}
                  {roleIcon()}
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-lg font-semibold">
                      {player.team}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-8 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
                {player.player}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 mr-14 ml-14">
            <Card className="bg-white/10 backdrop-blur-sm border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-white mr-4" />
                  <div>
                    <p className="text-md font-bold text-blue-200">Matches</p>
                    <p className="text-xl font-semibold text-white">
                      {player.matches}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <GiCricketBat className="w-8 h-8 text-white mr-4" />
                  <div>
                    <p className="text-md font-bold text-blue-200">Runs</p>
                    <p className="text-xl font-semibold text-white">
                      {player.runs}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BiSolidCricketBall className="w-8 h-8 text-white mr-4" />
                  <div>
                    <p className="text-md font-bold text-blue-200">Wickets</p>
                    <p className="text-xl font-semibold text-white">
                      {player.wickets}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-14 items-center">
            <Popover>
              <PopoverTrigger>
                <Button className="px-8 py-4 w-48 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg text-lg font-semibold hover:from-yellow-700 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-2">
                  Sell Player
                  <Gavel className="w-5 h-5" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-96 bg-gradient-to-br from-blue-900/95 to-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-lg shadow-xl p-6">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 border-b border-blue-500/30 pb-4">
                    <Gavel className="w-6 h-6 text-white" />
                    <h4 className="text-xl font-semibold text-white">
                      Sell Player
                    </h4>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-blue-200">
                        Selling Price
                      </Label>
                      <div className="flex items-center bg-white/10 rounded-lg border border-blue-500/30 focus-within:border-yellow-400/50 transition-colors">
                        <Input
                          id="price"
                          type="number"
                          className="h-10 flex-grow border-none bg-transparent text-white placeholder:text-blue-300 px-3"
                          placeholder="Enter price"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                        />
                        <span className="mr-3 text-blue-300">CR</span>
                      </div>
                    </div>

                    <div className="relative grid gap-2">
                      <Label htmlFor="team" className="text-blue-200">
                        Team
                      </Label>
                      <Input
                        id="team"
                        className="h-10 bg-white/10 rounded-lg border border-blue-500/30 focus:border-yellow-400/50 transition-colors text-white placeholder:text-blue-300 px-3"
                        value={soldTo}
                        onChange={handleTeamInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Start typing a team name..."
                      />
                      {showDropdown && filteredTeams.length > 0 && (
                        <div className="absolute top-full mt-1 w-full bg-blue-900/95 border border-blue-500/30 rounded-lg shadow-lg overflow-hidden z-10">
                          {filteredTeams.map((team, index) => (
                            <div
                              key={team}
                              className={`px-4 py-2 text-white cursor-pointer transition ${
                                index === highlightedIndex
                                  ? "bg-blue-600"
                                  : "hover:bg-blue-600"
                              }`}
                              onClick={() => selectTeam(team)}
                            >
                              {team}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/30">
                        {error}
                      </p>
                    )}

                    <div>
                      <Button
                        className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
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
              onClick={() =>
                router.push(`/auction/${parseInt(id as string) + 1}`)
              }
              className="w-48 ml-4 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
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
