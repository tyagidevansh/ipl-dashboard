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
const collection = database.collection("indians");

export async function GET() {
  try {
    await client.connect();
    const players = await collection.find({}).toArray();
    return NextResponse.json({ data: players });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, soldTo, sellingPrice } = await req.json();
    if (!name || !soldTo || sellingPrice == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await client.connect();
    const result = await collection.updateOne(
      { player: name },
      {
        $set: {
          isSold: true,
          soldTo,
          sellingPrice,
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Player updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await client.connect();
    await collection.updateMany({}, {
      $unset: {
        isSold: "",
        soldTo: "",
        sellingPrice: "",
      },
    });

    return NextResponse.json({ message: "All players reset successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reset players" }, { status: 500 });
  }
}
