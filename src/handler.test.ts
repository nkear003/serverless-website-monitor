import nock from "nock";
import { google } from "googleapis";
import { fetchWebsiteContent, getRange } from "./functions";
import credentials from "../credentials.json";
import { setupEnvironment } from "./config";

setupEnvironment();

// Don't print logs and warnings
beforeEach(() => {
  jest.spyOn(console, "info").mockImplementation(() => {});
  // jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  // jest.spyOn(console, "error").mockImplementation(() => {});
});

// Stop nock from intercepting
nock.restore();

describe("Google sheets helpers", () => {
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
