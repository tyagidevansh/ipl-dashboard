import { MongoClient, ServerApiVersion } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
if (!uri) {
  throw new Error("Can't find MongoDB URI in env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("ipl_db");
const indiansCollection = database.collection("indians");
const foreignersCollection = database.collection("foreigners");

// List of IPL teams
const teams: string[] = ["MI", "CSK", "RCB", "DC", "PBKS", "RR", "LSG", "GT", "KKR", "SRH"];

// Define player type
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

// Define team ranking structure
interface TeamRanking {
  team: string;
  totalImpact: number;
  players: PlayerData[];
}

// Function to fetch sold players
async function getSoldPlayers(collection: any): Promise<PlayerData[]> {
  return await collection.find({ isSold: true }).toArray();
}

export async function GET() {
  try {
    await client.connect();

    // Fetch sold players from both collections
    const [soldIndians, soldForeigners] = await Promise.all([
      getSoldPlayers(indiansCollection),
      getSoldPlayers(foreignersCollection),
    ]);

    // Initialize team rankings
    const teamRankings: TeamRanking[] = teams.map((team) => ({
      team,
      totalImpact: 0,
      players: [],
    }));

    // Function to update team impact and players
    function updateTeamRanking(players: PlayerData[]) {
      players.forEach((player) => {
        const teamIndex = teamRankings.findIndex((t) => t.team === player.soldTo);
        if (teamIndex !== -1) {
          teamRankings[teamIndex].players.push(player);
          teamRankings[teamIndex].totalImpact += player.impactPerMatch;
        }
      });
    }

    // Process Indians and Foreigners separately
    updateTeamRanking(soldIndians);
    updateTeamRanking(soldForeigners);

    // Filter out teams that do not meet the disqualification criteria
    const qualifiedTeams = teamRankings.filter((team) => {
      const players = team.players;
      const hasWicketkeeper = players.some((player) => player.role === "Wicketkeeper");
      const bowlerAndAllrounderCount = players.filter(
        (player) => player.role === "Bowler" || player.role === "Allrounder" || player.role === "Bowling Allrounder"
      ).length;

      return hasWicketkeeper && bowlerAndAllrounderCount >= 5 && players.length === 11;
    });

    // Sort qualified teams by total impact (descending order)
    qualifiedTeams.sort((a, b) => b.totalImpact - a.totalImpact);

    return NextResponse.json({ winners: qualifiedTeams });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch team rankings" }, { status: 500 });
  }
}
