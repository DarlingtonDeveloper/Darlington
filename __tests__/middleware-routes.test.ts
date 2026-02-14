import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("middleware protected routes", () => {
  const middlewareSrc = fs.readFileSync(
    path.resolve(__dirname, "../middleware.ts"),
    "utf-8",
  );

  it("protects /swarm route", () => {
    expect(middlewareSrc).toContain('"/swarm"');
  });

  it("does not protect old /mc route", () => {
    // Ensure /mc is not in the PROTECTED_ROUTES array
    // We check that "/mc" doesn't appear as a standalone route entry
    const routeEntries = middlewareSrc.match(/"\/([\w-]+)"/g) ?? [];
    expect(routeEntries).not.toContain('"/mc"');
  });
});
