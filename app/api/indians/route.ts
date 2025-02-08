import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.NEXT_PUBLIC_MONGODB_URI
if (!uri) {
  throw new Error("cant find mongodb uri in env")
}


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

async function run() {
  try {
    await client.connect()
    const database = client.db("ipl_db")
    const collection = database.collection("indians")
    const documents = await collection.find({}).toArray()
    return documents
  } catch (Exception) {
    console.log(Exception)
  }
}

export async function GET(reques: Request) {
  const players = await run()
  return Response.json({"data" : players})
}