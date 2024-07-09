import { fetchWebsiteContent } from "./handler";

describe("Basic tests", () => {
  test("results exists", async () => {
    const results = await fetchWebsiteContent();
    expect(results).not.toBeNull();
  });
});
