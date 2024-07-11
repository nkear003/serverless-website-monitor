import { google } from "googleapis";
import { fetchWebsiteContent, getRange } from "./functions";
import { setupEnvironment } from "./config";

setupEnvironment();

// Don't print info logs and warnings
beforeEach(() => {
  jest.spyOn(console, "info").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe("Google sheets helpers", () => {
  const credentials = {
    client_email: process.env.GOOGLE_API_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_API_PRIVATE_KEY,
  };
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // Acquire an auth client, and bind it to all future calls
  google.options({ auth: auth });
  const sheetName = process.env.GOOGLE_SHEET_NAME;

  test("get range contains google sheets syntax", async () => {
    const range = await getRange();
    expect(range).toContain(sheetName);
    expect(range).toContain(":");
    expect(range).toContain("!");
  });
});

describe("View count extractor", () => {
  it("should return a number on real html", async () => {
    const results = await fetchWebsiteContent(
      "https://www.youtube.com/watch?v=4rgYUipGJNo"
    );

    if (results) {
      expect(typeof results.viewCount).toBe("number");
    }
  });
});
