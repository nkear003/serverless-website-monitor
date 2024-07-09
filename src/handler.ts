import axios from "axios";
import cheerio from "cheerio";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials({
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
});

const sheets = google.sheets({ version: "v4", auth: oauth2Client });
const sheetId = process.env.GOOGLE_SHEET_ID;

let previousContent = "";

async function fetchWebsiteContent(): Promise<string | null> {
  try {
    const response = await axios.get(process.env.MONITOR_URL as string);
    const $ = cheerio.load(response.data);
    return $("body").html() || "";
  } catch (error) {
    console.error("Error fetching website content:", error);
    return null;
  }
}

async function notifyChange(change: string): Promise<void> {
  const emailMessage = {
    to: process.env.TO_EMAIL as string,
    from: process.env.FROM_EMAIL as string,
    subject: "Website Change Detected",
    text: `Change detected on ${process.env.MONITOR_URL}:\n\n${change}`,
  };

  try {
    await sgMail.send(emailMessage);
    console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
  }

  //   try {
  //     await twilioClient.messages.create({
  //       body: `Change detected on ${process.env.MONITOR_URL}:\n\n${change}`,
  //       from: process.env.TWILIO_PHONE_NUMBER,
  //       to: process.env.TO_PHONE_NUMBER,
  //     });
  //     console.log("SMS sent");
  //   } catch (error) {
  //     console.error("Error sending SMS:", error);
  //   }
}

async function logChangeToSheet(change: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      resource: {
        values: [[now, change]],
      },
    });
    console.log("Change logged to Google Sheet");
  } catch (error) {
    console.error("Error logging change to Google Sheet:", error);
  }
}

export const monitor = async (): Promise<void> => {
  const currentContent = await fetchWebsiteContent();
  if (!currentContent) return;

  if (currentContent !== previousContent) {
    const change = `Content changed at ${new Date().toISOString()}`;
    console.log(change);
    // await notifyChange(change);
    // await logChangeToSheet(change);
    previousContent = currentContent;
  }
};
