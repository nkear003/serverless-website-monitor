import { MongoClient } from "mongodb";
import type { Payload } from "./global";

dotenv.config();

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!process.env?.MONGO_URL) {
    throw new Error("Missing mongodb connection string in env variables");
  }

  const client = new MongoClient(process.env.MONGO_URL);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    cachedClient = client;
    return client;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    console.log("MongoDB connection closed");
    cachedClient = null;
  }
}
