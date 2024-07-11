import { getRange, notifyChangeMock, fetchWebsiteContent } from "./functions";
import connectToDatabase from "./mongodb";
import { google } from "googleapis";
import dotenv from "dotenv";
import credentials from "../credentials.json";

dotenv.config();

let previousContent = "";

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
const collection = process.env.DB_COLLECTION_NAME || "default";

export const monitor = async (): Promise<void> => {
  try {
    const db = await connectToDatabase();

    const currentContent = await fetchWebsiteContent();
    if (!currentContent) return;

    if (currentContent !== previousContent) {
      const changeMessage = `Content changed at ${new Date().toISOString()}`;

      // Update google sheets
      const range = await getRange();
      sheets.spreadsheets.values.update({
        range,
        spreadsheetId,
        valueInputOption,
        requestBody: {
          values: [[changeMessage]],
        },
      });

      await db.collection(collection).insertOne({ message: changeMessage });
      await notifyChangeMock(changeMessage);
      previousContent = currentContent;
    }
  } catch (err) {
    console.error("Error in monitor function:", err);
    throw err;
  }
};
