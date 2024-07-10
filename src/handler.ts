import axios from "axios";
import cheerio from "cheerio";
// import sgMail from "@sendgrid/mail";
// import twilio from "twilio";
// import { google } from "googleapis";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { writeOneToDb, closeDatabaseConnection } from "./mongodb";
import type { Payload } from "./global";

dotenv.config();

const {
  ETHEREAL_PASSWORD: etherealPass,
  ETHEREAL_NAME: etherealName,
  ETHEREAL_USER: etherealUser,
  TO_EMAIL: toEmail,
  MONITOR_URL: monitorUrl,
} = process.env;

export const notifyChangeMock = async (changeMessage: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: etherealUser,
        pass: etherealPass,
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${etherealName}" <${etherealUser}>`, // sender address
      to: toEmail, // list of receivers
      subject: "Change to website", // Subject line
      text: changeMessage, // plain text body
      html: `<b>${changeMessage}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId); // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    return info.messageId;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

// sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const oauth2Client = new google.auth.OAuth2();
// oauth2Client.setCredentials({
//   client_email: process.env.GOOGLE_CLIENT_EMAIL,
//   private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
// });

// const sheets = google.sheets({ version: "v4", auth: oauth2Client });
// const sheetId = process.env.GOOGLE_SHEET_ID;

let previousContent = "";

export async function fetchWebsiteContent(
  url: string | undefined = monitorUrl
): Promise<string | null> {
  try {
    const response = await axios.get(url as string);
    const $ = cheerio.load(response.data);
    return $("body").html();
  } catch (err) {
    console.error("Error fetching website content:", err);
    return null;
  }
}

// async function notifyChange(change: string): Promise<void> {
//   const emailMessage = {
//     to: process.env.TO_EMAIL as string,
//     from: process.env.FROM_EMAIL as string,
//     subject: "Website Change Detected",
//     text: `Change detected on ${process.env.MONITOR_URL}:\n\n${change}`,
// };

//   try {
//     await sgMail.send(emailMessage);
//     console.log("Email sent");
//   } catch (err) {
//     console.error("Error sending email:", error);
//   }

//     try {
//       await twilioClient.messages.create({
//         body: `Change detected on ${process.env.MONITOR_URL}:\n\n${change}`,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: process.env.TO_PHONE_NUMBER,
//       });
//       console.log("SMS sent");
//     } catch (err) {
//       console.error("Error sending SMS:", error);
//     }
// }

// async function logChangeToSheet(change: string): Promise<void> {
//   const now = new Date().toISOString();
//   try {
//     await sheets.spreadsheets.values.append({
//       spreadsheetId: sheetId,
//       range: "Sheet1!A1",
//       valueInputOption: "RAW",
//       resource: {
//         values: [[now, change]],
//       },
//     });
//     console.log("Change logged to Google Sheet");
//   } catch (err) {
//     console.error("Error logging change to Google Sheet:", error);
//   }
// }

export async function writeToDb(payload: Payload) {
  try {
    const result = await writeOneToDb(payload);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("Error in fetchDataFromMongoDB:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  } finally {
    // Optionally close the connection after each request
    await closeDatabaseConnection();
  }
}

export const monitor = async (): Promise<void> => {
  const currentContent = await fetchWebsiteContent();
  if (!currentContent) return;

  if (currentContent !== previousContent) {
    const changeMessage = `Content changed at ${new Date().toISOString()}`;
    await notifyChangeMock(changeMessage);
    await writeOneToDb({ message: changeMessage });
    // await logChangeToSheet(changeMessage);
    previousContent = currentContent;
  }
};
