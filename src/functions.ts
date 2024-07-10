import nodemailer from "nodemailer";
import axios from "axios";
import cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

export async function notifyChangeMock(changeMessage: string) {
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

export async function fetchWebsiteContent(
  url: string | undefined = process.env.MONITOR_URL
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
