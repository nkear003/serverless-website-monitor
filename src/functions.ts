import nodemailer from "nodemailer";
import axios from "axios";
import cheerio from "cheerio";
import { google } from "googleapis";
import { setupEnvironment } from "./config";

setupEnvironment();

const { GOOGLE_SHEET_ID: spreadsheetId, GOOGLE_SHEET_NAME: sheetName } =
  process.env;

const sheets = google.sheets("v4");

export const getRange = async (): Promise<string> => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A:A",
  });

  const rows = res.data.values;
  const rowNumber = rows ? rows.length + 1 : 1;
  return `${sheetName}!${rowNumber}:${rowNumber}`; // Example Sheet1!1:1
};

export async function notifyChangeByEmail(
  changeMessage: string
): Promise<string> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.ETHEREAL_NAME}" <${process.env.ETHEREAL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: "Change to website",
      text: changeMessage,
      html: `<b>${changeMessage}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId;
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send notification email");
  }
}

export async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $("body").html();
  } catch (err) {
    console.error("Error fetching website content", err);
    return null;
  }
}

export function extractViews(html: string | null): number | null {
  if (html === null) return html;

  // Regular expression to match a number with commas followed by " views"
  const regex = /(\d{1,3}(?:,\d{3})*) views/g;

  // Find all matches in the HTML
  const matches = html.match(regex);

  if (!matches) return null;

  // Extract the first match and remove commas
  const numberWithCommas = matches[0].replace(/,/g, "");

  // Extract the number part and parse it into a number
  const number = parseInt(numberWithCommas, 10);

  // Return the number
  return number;
}
