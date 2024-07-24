import nodemailer from "nodemailer";
import axios from "axios";
import cheerio from "cheerio";
import { google } from "googleapis";
import { setupEnvironment } from "./config";

setupEnvironment();

const { GOOGLE_SHEET_ID: spreadsheetId, GOOGLE_SHEET_NAME: sheetName } =
  process.env;

const sheets = google.sheets("v4");

/**
 * Checks the Google Sheet for the available free row
 * 
 * @returns The range in the Google Sheet document where we should write to in the format for Google Sheets API. Example: Sheet1!1:1
 */
export const getRange = async (): Promise<string> => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A:A",
  });

  // Checks to see how many rows there are, if there is something there, return next available row, otherwise return the first row
  const rows = res.data.values;
  const rowNumber = rows ? rows.length + 1 : 1;
  return `${sheetName}!${rowNumber}:${rowNumber}`; // Example Sheet1!1:1
};

export async function notifyChangeByEmail({
  subject = "View count changed",
  text,
  viewCount,
}: {
  subject?: string;
  text: string;
  viewCount: number;
}): Promise<void> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    });

    const website = process.env.MONITOR_URL;
    const googleSheetUrl = process.env.GOOGLE_SHEET_PUBLIC_URL;
    const html = `
      <h1>View count has changed</h1>
      <p>View count for <a href="${website}">${website}</a> has changed to ${viewCount}</p>
      <p>You can check out the most recent updates here: <a href="${googleSheetUrl}">${googleSheetUrl}</p>
    `;
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.ETHEREAL_EMAIL}>`,
      to: process.env.TO_EMAIL,
      subject: subject,
      text: text,
      html,
    });

    console.info("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send notification email");
  }
}

export async function fetchWebsiteContent(url: string) {
  try {
    // Get the URL
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract the view count
    const viewCountText = $('meta[itemprop="interactionCount"]').attr(
      "content"
    );

    const viewCount = viewCountText ? parseInt(viewCountText, 10) : undefined;

    return {
      viewCount: viewCount || undefined,
    };
  } catch (err) {
    console.error("Error fetching website content", err);
    return null;
  }
}
