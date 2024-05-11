// @jest-environment jsdom
import { getAbsoluteUrl } from "@/utils/url";

describe("absoluteUrl", () => {
  test("", () => {
    expect(getAbsoluteUrl("/a/b", "http://localhost:3000")).toBe(
      "http://localhost:3000/a/b"
    );
    expect(getAbsoluteUrl("/a/b", "http://localhost:3000/c")).toBe(
      "http://localhost:3000/a/b"
    );
    expect(getAbsoluteUrl("/a/b", "http://localhost:3000/c/")).toBe(
      "http://localhost:3000/a/b"
    );
    expect(getAbsoluteUrl("/a/b", "http://localhost:3000/c/d.json")).toBe(
      "http://localhost:3000/a/b"
    );
    expect(getAbsoluteUrl("a/b", "http://localhost:3000/c")).toBe(
      "http://localhost:3000/c/a/b"
    );
    expect(getAbsoluteUrl("a/b", "http://localhost:3000/c/")).toBe(
      "http://localhost:3000/c/a/b"
    );
    expect(getAbsoluteUrl("a/b", "http://localhost:3000/c/d.json")).toBe(
      "http://localhost:3000/c/a/b"
    );
    expect(getAbsoluteUrl("http://localhost:3000/a/b")).toBe(
      "http://localhost:3000/a/b"
    );
  });
});
