import {
  getRange,
  notifyChangeByEmail,
  fetchWebsiteContent,
} from "./functions";
import { google } from "googleapis";
import credentials from "../credentials.json";
import { Context } from "aws-lambda";
import { MongoClient } from "mongodb";
import { setupEnvironment } from "./config";

setupEnvironment();

// let previousViewCount = undefined;

// Acquire an auth client, and bind it to all future calls
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
let cachedClient: MongoClient | null = null;
let client: MongoClient | null = null;
if (cachedClient) {
  client = cachedClient;
} else {
  client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
  cachedClient = client;
}
const dbName = process.env.DB_NAME || "default";
const collection = process.env.DB_COLLECTION_NAME || "default";

export const monitor = async (context?: Context): Promise<void> => {
  try {
    if (context) context.callbackWaitsForEmptyEventLoop = false;

    const results = await fetchWebsiteContent(process.env.MONITOR_URL);
    const viewCount = results?.viewCount;
    // if (!currentContent) return;

    // if (currentContent !== previousContent) {
    const date = new Date().toISOString();
    const changeMessage = `Content changed at ${date}`;
    // const currentViews = extractViews(currentContent);

    // Update google sheets
    const range = await getRange();
    sheets.spreadsheets.values.update({
      range,
      spreadsheetId,
      valueInputOption,
      requestBody: {
        values: [[date, viewCount]],
      },
    });

    // Update db
    const clientConnection = await client.connect();
    const db = clientConnection.db(dbName);
    await db.collection(collection).insertOne({
      timestamp: date,
      // viewsBefore: previousViews,
      viewCount,
    });
    await notifyChangeByEmail(changeMessage);
    // previousContent = currentContent;
    // }
  } catch (err) {
    console.error("Error in monitor function:", err);
    throw err;
  }
};
