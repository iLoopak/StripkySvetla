import { describe, expect, it } from "vitest";
import { resolveHorizontalFacing } from "./characterFacing";

describe("resolveHorizontalFacing", () => {
  it("uses movement projected onto the camera's screen-right direction", () => {
    expect(resolveHorizontalFacing({ x: 1, z: 0 }, { x: 1, z: 0 }, "left")).toBe("right");
    expect(resolveHorizontalFacing({ x: -1, z: 0 }, { x: 1, z: 0 }, "right")).toBe(
      "left",
    );
  });

  it("keeps the previous facing for screen-vertical movement", () => {
    expect(resolveHorizontalFacing({ x: 0, z: -1 }, { x: 1, z: 0 }, "left")).toBe("left");
    expect(resolveHorizontalFacing({ x: 0, z: 1 }, { x: 1, z: 0 }, "right")).toBe(
      "right",
    );
  });

  it("keeps the previous facing when movement or camera projection is absent", () => {
    expect(resolveHorizontalFacing({ x: 0, z: 0 }, { x: 1, z: 0 }, "left")).toBe("left");
    expect(resolveHorizontalFacing({ x: 1, z: 0 }, { x: 0, z: 0 }, "right")).toBe(
      "right",
    );
  });
});
