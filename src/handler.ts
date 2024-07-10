import { getRange, notifyChangeMock, fetchWebsiteContent } from "./functions";
import { writeOneToDb } from "./mongodb";
import { google } from "googleapis";
import dotenv from "dotenv";
import credentials from "../credentials.json";

dotenv.config();

const sheets = google.sheets("v4");

let previousContent = "";

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Acquire an auth client, and bind it to all future calls
google.options({ auth: auth });

// Replace with your spreadsheet ID and range
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Example data to write
const valueInputOption = "RAW";

export const monitor = async (): Promise<void> => {
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

    await writeOneToDb({ message: changeMessage });
    await notifyChangeMock(changeMessage);
    previousContent = currentContent;
  }
};
