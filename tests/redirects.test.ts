import { describe, expect, it } from "vitest";
import { articlePath, followRedirectChain } from "@/lib/redirects/chain";

describe("followRedirectChain", () => {
  it("returns start when no edges exist", () => {
    expect(followRedirectChain({}, "/article/a")).toBe("/article/a");
  });

  it("follows a single hop", () => {
    expect(
      followRedirectChain({ "/article/a": "/article/b" }, "/article/a"),
    ).toBe("/article/b");
  });

  it("collapses chains to final destination", () => {
    const edges = {
      "/article/a": "/article/b",
      "/article/b": "/article/c",
    };
    expect(followRedirectChain(edges, "/article/a")).toBe("/article/c");
  });

  it("stops on cycles", () => {
    const edges = {
      "/a": "/b",
      "/b": "/a",
    };
    expect(followRedirectChain(edges, "/a")).toBe("/a");
  });
});

describe("articlePath", () => {
  it("builds canonical article paths", () => {
    expect(articlePath("hello-world")).toBe("/article/hello-world");
  });
});
