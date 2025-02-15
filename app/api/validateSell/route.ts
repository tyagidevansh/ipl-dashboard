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

const MAX_INDIANS = 7;
const MAX_FOREIGNERS = 4;
const TOTAL_PURSE = 100;

export async function POST(req: Request) {
  try {
    const { playerName, foreigner, soldTo, sellingPrice } = await req.json();
    if (!playerName || !soldTo || sellingPrice == null) {
      return NextResponse.json({ valid: false, error: "Missing required fields" }, { status: 400 });
    }

    await client.connect();

    const [indians, foreigners] = await Promise.all([
      indiansCollection.find({ soldTo }).toArray(),
      foreignersCollection.find({ soldTo }).toArray(),
    ]);

    const currentIndians = indians.length;
    const currentForeigners = foreigners.length;
    const currentPurseSpent = [...indians, ...foreigners].reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
    const purseRemaining = TOTAL_PURSE - currentPurseSpent;

    if (foreigner) {
      if (currentForeigners + 1 > MAX_FOREIGNERS) {
        return NextResponse.json({ valid: false, error: "Cannot have more than 4 foreign players" });
      }
    } else {
      if (currentIndians + 1 > MAX_INDIANS) {
        return NextResponse.json({ valid: false, error: "Cannot have more than 7 Indian players" });
      }
    }

    if (purseRemaining < sellingPrice) {
      return NextResponse.json({ valid: false, error: "Insufficient purse to buy this player" });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
