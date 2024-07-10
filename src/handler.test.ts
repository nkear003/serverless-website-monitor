import nock from "nock";
import { fetchWebsiteContent, notifyChangeMock } from "./handler";
// import { writeOneToDb, closeDatabaseConnection } from "./mongodb";

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

afterEach(() => {
  nock.cleanAll();
});

describe("Website fetching function", () => {
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

// describe("MongoDB", () => {
//   test("connection to DB", async () => {
//     try {
//       const client = await connectToDatabase();
//       expect(client).toBeDefined();
//     } catch (err) {
//       console.err("Error connecting to database", err);
//     } finally {
//       await closeDatabaseConnection();
//     }
//   });

//   test("find one item in database", async () => {
//     try {
//       const client = await connectToDatabase();
//       const db = client.db("default");
//       const result = db.collection("default").findOne();
//       console.log(result);
//       expect(result).toBeDefined();
//     } catch (err) {
//       console.err("Error connecting to database", err);
//     } finally {
//       await closeDatabaseConnection();
//     }
//   });

//   test("write one item to database", async () => {
//     try {
//       const client = await connectToDatabase();
//       const db = client.db("default");
//       console.log(result);
//       expect(result).toBeDefined();
//     } catch (err) {
//       console.err("Error connecting to database", err);
//     } finally {
//       await closeDatabaseConnection();
//     }
//   });
// });
