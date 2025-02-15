import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
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

// Define the 10 IPL teams
const teams: string[] = ["MI", "CSK", "RCB", "DC", "PBKS", "RR", "LSG", "GT", "KKR", "SRH"];

// Type for a Player Document
interface Player {
  _id: ObjectId;
  player: string;
  role: string;
  sellingPrice: number;
  soldTo: string;
  isSold: boolean;
}

// Type for a Team Player Entry (returned in API)
interface TeamPlayer {
  _id: ObjectId;
  name: string;
  sellingPrice: number;
  role: string;
}

// Type for Team Data Structure
interface TeamData {
  team: string;
  players: {
    indians: TeamPlayer[];
    foreigners: TeamPlayer[];
  };
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

// Function to fetch sold players from a collection
async function getSoldPlayers(collection: any): Promise<Player[]> {
  return await collection.find({ isSold: true }).toArray();
}

export async function GET() {
  try {
    await client.connect();

    // Fetch all sold players from both collections
    const [soldIndians, soldForeigners] = await Promise.all([
      getSoldPlayers(indiansCollection),
      getSoldPlayers(foreignersCollection),
    ]);

    // Initialize team data with correct types
    const teamData: TeamData[] = teams.map((team) => ({
      team,
      players: {
        indians: [],
        foreigners: [],
      },
      totalPlayers: {
        indians: 0,
        foreigners: 0,
      },
      purseRemaining: 100, // Start with 100 CR
      roleCounts: {
        batsmen: 0,
        bowlers: 0,
        wicketkeepers: 0,
        allRounders: 0,
      },
    }));

    // Function to update team data based on player type
    function updateTeamData(players: Player[], type: "indians" | "foreigners") {
      players.forEach((player) => {
        const teamIndex = teamData.findIndex((t) => t.team === player.soldTo);
        if (teamIndex !== -1) {
          // Add player to respective category
          teamData[teamIndex].players[type].push({
            _id: player._id,
            name: player.player,
            sellingPrice: player.sellingPrice,
            role: player.role,
          });

          // Increase player count
          teamData[teamIndex].totalPlayers[type] += 1;
          teamData[teamIndex].purseRemaining -= player.sellingPrice;

          // Update role counts
          if (player.role.toLowerCase().includes("batsman")) {
            teamData[teamIndex].roleCounts.batsmen += 1;
          } else if (player.role.toLowerCase().includes("bowler")) {
            teamData[teamIndex].roleCounts.bowlers += 1;
          } else if (player.role.toLowerCase().includes("wicketkeeper")) {
            teamData[teamIndex].roleCounts.wicketkeepers += 1;
          } else {
            teamData[teamIndex].roleCounts.allRounders += 1;
          }
        }
      });
    }

    // Update team data for both categories
    updateTeamData(soldIndians, "indians");
    updateTeamData(soldForeigners, "foreigners");

    return NextResponse.json({ teams: teamData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 });
  }
}
