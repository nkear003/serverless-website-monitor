import {
  getRange,
  notifyChangeByEmail,
  fetchWebsiteContent,
} from "./functions";
import { google } from "googleapis";
import { Context } from "aws-lambda";
import { MongoClient } from "mongodb";
import { setupEnvironment } from "./config";

setupEnvironment();

type ChangeDoc = {
  changeTimestamp: Date;
  viewCount: number;
};

// Acquire an auth client, and bind it to all future calls
const credentials = {
  client_email: process.env.GOOGLE_API_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_API_PRIVATE_KEY,
};
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
google.options({ auth: auth });

// Setup google sheets options
const sheets = google.sheets("v4");
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const valueInputOption = "RAW";

// Setup mongoDB
let cachedMongoClient: MongoClient | null = null;
let mongoClient: MongoClient | null = null;
if (cachedMongoClient) {
  console.info("Mongo client existed");
  mongoClient = cachedMongoClient;
} else {
  console.info("Mongo client didn't exist, creating new...");
  mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING);
  cachedMongoClient = mongoClient;
}
const dbName = process.env.DB_NAME || "default";
const collection = process.env.DB_COLLECTION_NAME || "default";

mongoClient.on("close", () => {
  console.info("MongoDB client closed");
});

export const monitor = async (context?: Context): Promise<void> => {
  try {
    if (context) context.callbackWaitsForEmptyEventLoop = false;

    // Fetch the website
    const results = await fetchWebsiteContent(process.env.MONITOR_URL);
    if (typeof results?.viewCount !== "number") {
      throw new Error("Website fetch failed");
    }
    const currentViewCount = results?.viewCount;

    // Establish connection to MongoDB
    const clientConnection = await mongoClient.connect();
    console.info("Connected to DB");
    const db = clientConnection.db(dbName);

    // Get the last document to see if there are changes
    const latestDoc = await db
      .collection<ChangeDoc>(collection)
      .findOne({}, { sort: { createdAt: -1 } });

    // If the view count is the same, stop function execution
    if (latestDoc?.viewCount === currentViewCount) {
      console.log("Nothing new");
      return;
    }

    // Create a new date here to be used throughout
    const date = new Date();

    // Update google sheets
    const range = await getRange();
    sheets.spreadsheets.values.update({
      range,
      spreadsheetId,
      valueInputOption,
      requestBody: {
        values: [[date, currentViewCount]],
      },
    });

    const dbUpdateDoc: ChangeDoc = {
      changeTimestamp: date,
      viewCount: currentViewCount,
    };

    // Add change to database
    await db.collection(collection).insertOne(dbUpdateDoc);

    // Send email
    const changeMessage = `Content changed at ${date.toISOString()}`;
    await notifyChangeByEmail({
      text: changeMessage,
      viewCount: currentViewCount,
    });
  } catch (err) {
    console.error("Error in monitor function:", err);
    throw err;
  }
};
