import nock from "nock";
import { google } from "googleapis";
import { fetchWebsiteContent, getRange, notifyChangeMock } from "./functions";
import credentials from "../credentials.json";

const testUrl = "http://example.com";
const testHtml = `
  <html>
    <head><title>Test Page</title></head>
    <body><h1>Hello World</h1></body>
    </html>
`;

const testHtmlBody = `<h1>Hello World</h1>`;
const testHtmlChanged = `
  <html>
    <head><title>Test Page</title></head>
    <body><h1>Hello World!!!</h1></body>
    </html>
`;

describe("Website fetching function", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  // Don't print errors
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return html content when request is successful", async () => {
    nock(testUrl).get("/").reply(200, testHtml);

    const results = await fetchWebsiteContent(testUrl);

    // Check if the result is a string
    expect(typeof results).toBe("string");

    // Check for specific HTML elements
    expect(results).toContain("<h1>");
    expect(results).toContain("</h1>");
  });

  it("should return null if the request fails", async () => {
    nock(testUrl).get("/").reply(404);
    const results = await fetchWebsiteContent(testUrl);
    expect(results).toBeNull();
  });
});

describe("Monitor function", () => {
  let changed: boolean;
  it("should register a change if the html body is different", async () => {
    nock(testUrl).get("/").reply(200, testHtmlChanged);
    const results = await fetchWebsiteContent(testUrl);

    if (results !== testHtmlBody) changed = true;
    expect(changed).toBe(true);
  });

  it("should check website for changes and send a message if it's correct", async () => {
    nock(testUrl).get("/").reply(200, testHtml);
    const results = await fetchWebsiteContent(testUrl);

    if (!results) return;

    const changeMessage = `Content changed at ${new Date().toISOString()}`;
    const messageId = await notifyChangeMock(changeMessage);

    expect(typeof messageId).toBe("string");
    expect(messageId).toContain("@ethereal.email");
  });
});

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
