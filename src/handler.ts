import axios from "axios";
import cheerio from "cheerio";
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
      secure: false,
      auth: {
        user: etherealUser,
        pass: etherealPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${etherealName}" <${etherealUser}>`,
      to: toEmail,
      subject: "Change to website",
      text: changeMessage,
      html: `<b>${changeMessage}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId;
  } catch (err) {
    console.error("Error sending email:", err);
    return undefined;
  }
};

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

export async function writeToDb(payload: Payload) {
  try {
    await writeOneToDb(payload);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data written to database" }),
    };
  } catch (err) {
    console.error("Error writing to database:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}

export const monitor = async (): Promise<void> => {
  const currentContent = await fetchWebsiteContent();
  if (!currentContent) return;

  if (currentContent !== previousContent) {
    const changeMessage = `Content changed at ${new Date().toISOString()}`;
    await notifyChangeMock(changeMessage);
    await writeOneToDb({ message: changeMessage });
    previousContent = currentContent;
  }
};

// Ensure the database connection is closed when the process exits
process.on("SIGINT", async () => {
  await closeDatabaseConnection();
  process.exit();
});
