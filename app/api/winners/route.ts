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

// Fetch sold players
async function getSoldPlayers(collection: any): Promise<PlayerData[]> {
  return await collection.find({ isSold: true }).toArray();
}

// Check if team composition is valid
function meetsTeamComposition(players: PlayerData[]): boolean {
  let battingOptions = 0;
  let bowlingOptions = 0;
  let hasWicketkeeper = false;

  players.forEach((player) => {
    const role = player.role;

    if (role === "Wicketkeeper") {
      hasWicketkeeper = true;
      battingOptions++;
    } else if (role === "Batsman") {
      battingOptions++;
    } else if (role === "Allrounder" || role === "Bowling Allrounder") {
      battingOptions++;
      bowlingOptions++;
    } else if (role === "Bowler") {
      bowlingOptions++;
    }
  });

  return (
    hasWicketkeeper &&
    battingOptions >= 7 &&
    bowlingOptions >= 5 &&
    players.length === 11
  );
}

export async function GET() {
  try {
    await client.connect();

    const [soldIndians, soldForeigners] = await Promise.all([
      getSoldPlayers(indiansCollection),
      getSoldPlayers(foreignersCollection),
    ]);

    const teamRankings: TeamRanking[] = teams.map((team) => ({
      team,
      totalImpact: 0,
      players: [],
    }));

    function updateTeamRanking(players: PlayerData[]) {
      players.forEach((player) => {
        const teamIndex = teamRankings.findIndex((t) => t.team === player.soldTo);
        if (teamIndex !== -1) {
          teamRankings[teamIndex].players.push(player);
          teamRankings[teamIndex].totalImpact += player.impactPerMatch;
        }
      });
    }

    updateTeamRanking(soldIndians);
    updateTeamRanking(soldForeigners);

    const qualifiedTeams = teamRankings
      .filter((team) => meetsTeamComposition(team.players))
      .sort((a, b) => b.totalImpact - a.totalImpact)
      .slice(0, 4); // Top 4 teams

    return NextResponse.json({ winners: qualifiedTeams });
  } catch (error) {
    console.error("Error fetching team rankings:", error);
    return NextResponse.json({ error: "Failed to fetch team rankings" }, { status: 500 });
  }
}
