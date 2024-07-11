import nock from "nock";
import { google } from "googleapis";
import {
  extractViews,
  fetchWebsiteContent,
  getRange,
  notifyChangeByEmail,
} from "./functions";
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
    const messageId = await notifyChangeByEmail(changeMessage);

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

describe("View count extractor", () => {
  it("should return the correct number of views without commas", () => {
    const testHtmlYtVideo = `<ytd-watch-info-text id="ytd-watch-info-text" class="style-scope ytd-watch-metadata" view-count-props="{&quot;numberText&quot;:&quot;12,840,948&quot;,&quot;numberValue&quot;:12840948,&quot;heightPx&quot;:20,&quot;shouldAnimate&quot;:true}" date-text-props="{&quot;numberText&quot;:&quot;9&quot;,&quot;heightPx&quot;:20,&quot;shouldAnimate&quot;:true}" view-count-post-number-text="{&quot;runs&quot;:[{&quot;text&quot;:&quot; views  &quot;,&quot;bold&quot;:true}]}" date-text-post-number-text="{&quot;runs&quot;:[{&quot;text&quot;:&quot;,   &quot;,&quot;bold&quot;:true}]}" date-text-pre-number-text="{&quot;runs&quot;:[{&quot;text&quot;:&quot;Jul &quot;,&quot;bold&quot;:true}]}"><!--css-build:shady--><!--css-build:shady--><div id="info-container" class="style-scope ytd-watch-info-text">
  <div id="view-count" class="style-scope ytd-watch-info-text" aria-label="12,840,948 views  ">
    <yt-formatted-string aria-hidden="true" class="style-scope ytd-watch-info-text" is-empty="function(){var e=va.apply(0,arguments);a.loggingStatus.currentExternalCall=b;a.loggingStatus.bypassProxyController=!0;var g,k=((g=a.is)!=null?g:a.tagName).toLowerCase();kF(k,b,&quot;PROPERTY_ACCESS_CALL_EXTERNAL&quot;);var m;g=(m=c!=null?c:d[b])==null?void 0:m.call.apply(m,[d].concat(ia(e)));a.loggingStatus.currentExternalCall=void 0;a.loggingStatus.bypassProxyController=!1;return g}"><!--css-build:shady--><!--css-build:shady--><yt-attributed-string class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
    <yt-animated-rolling-number class="animated-rolling-number-wiz style-scope ytd-watch-info-text" dir="ltr" aria-hidden="true" style="height: 20px; line-height: 20px;"><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -20px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -40px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -20px;"><div>&nbsp;</div><div>,</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -160px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -260px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -360px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -20px;"><div>&nbsp;</div><div>,</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -340px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -200px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -220px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character></yt-animated-rolling-number>
    <yt-formatted-string aria-hidden="true" class="style-scope ytd-watch-info-text"><span dir="auto" class="bold style-scope yt-formatted-string" style-target="bold"> views  </span></yt-formatted-string>
  </div>
  <div id="date-text" class="style-scope ytd-watch-info-text" aria-label="Jul 9,   ">
    <yt-formatted-string aria-hidden="true" class="style-scope ytd-watch-info-text"><span dir="auto" class="bold style-scope yt-formatted-string" style-target="bold">Jul </span></yt-formatted-string>
    <yt-animated-rolling-number class="animated-rolling-number-wiz style-scope ytd-watch-info-text" dir="ltr" aria-hidden="true" style="height: 20px; line-height: 20px;"><animated-rolling-character class="animated-rolling-character-wiz" style="margin-top: -220px;"><div>&nbsp;</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>&nbsp;</div></animated-rolling-character></yt-animated-rolling-number>
    <yt-formatted-string aria-hidden="true" class="style-scope ytd-watch-info-text"><span dir="auto" class="style-scope yt-formatted-string bold" style-target="bold">,   </span></yt-formatted-string>
  </div>
  <yt-formatted-string id="info" class="style-scope ytd-watch-info-text" has-link-only_=""><a class="yt-simple-endpoint style-scope yt-formatted-string bold" spellcheck="false" href="/feed/trending" dir="auto" style-target="bold">#4 on Trending</a></yt-formatted-string>
  <dom-if class="style-scope ytd-watch-info-text"><template></template></dom-if>
</div>
<tp-yt-paper-tooltip class="style-scope ytd-watch-info-text" role="tooltip" tabindex="-1" style="left: 448.898438px; top: 46px;"><!--css-build:shady--><div id="tooltip" class="style-scope tp-yt-paper-tooltip hidden" style-target="tooltip">
  12,840,948 views • Jul 9, 2024 • #4 on Trending
</div>
</tp-yt-paper-tooltip>
</ytd-watch-info-text>`;

    const views = extractViews(testHtmlYtVideo);
    expect(views).toStrictEqual(12840948);
  });
});
