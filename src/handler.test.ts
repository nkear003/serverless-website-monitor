import { monitor } from "./handler";

describe("Monitor should return something", () => {
  test("returns anything", () => {
    const results = monitor();
    expect(results).not.toBe(false);
  });
});
