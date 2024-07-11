import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let cachedClient: MongoClient | null = null;

export default async function connectToDatabase() {
  const dbName = process.env.DB_NAME || "default";
  if (!process.env.DB_NAME) {
    console.warn("Missing DB name in environment variables, using default");
  }

  if (cachedClient) {
    return cachedClient.db(dbName);
  }

  if (!process.env?.MONGO_CONNECTION_STRING) {
    throw new Error("Missing mongodb connection string in env variables");
  }

  const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    cachedClient = client;
    return client.db(dbName);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}
