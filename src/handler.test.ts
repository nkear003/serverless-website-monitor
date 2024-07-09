import { monitor } from "./handler";

describe("Basic monitor test", () => {
  test("results exists", async () => {
    const results = await monitor();
    expect(results).toBeDefined();
  });
});
