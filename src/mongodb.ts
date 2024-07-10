import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import type { Payload } from "./global";

dotenv.config();

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
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

export async function writeOneToDb(
  payload: Payload,
  collection: string = process.env.DB_COLLECTION_NAME || "default"
) {
  if (!payload) throw new Error("Missing payload");

  try {
    const db = await connectToDatabase();
    await db.collection(collection).insertOne(payload);
    console.log("Data written to MongoDB");
  } catch (err) {
    console.error("Error writing data to MongoDB", err);
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