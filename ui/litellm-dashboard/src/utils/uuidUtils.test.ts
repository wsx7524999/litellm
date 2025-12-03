import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateUUID } from "./uuidUtils";

describe("generateUUID", () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe("with crypto.randomUUID available", () => {
    let randomUUIDSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Spy on crypto.randomUUID
      randomUUIDSpy = vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-uuid-1234-5678-9abc-def012345678" as `${string}-${string}-${string}-${string}-${string}`);
    });

    afterEach(() => {
      randomUUIDSpy.mockRestore();
    });

    it("should use crypto.randomUUID when available", () => {
      const uuid = generateUUID();
      expect(uuid).toBe("mock-uuid-1234-5678-9abc-def012345678");
      expect(randomUUIDSpy).toHaveBeenCalled();
    });
  });

  describe("UUID format validation", () => {
    it("should generate valid UUID v4 format in normal environment", () => {
      const uuid = generateUUID();

      expect(uuid).toMatch(uuidRegex);
      expect(uuid.length).toBe(36);
    });

    it("should generate unique UUIDs on multiple calls", () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const uuid = generateUUID();
        expect(uuid).toMatch(uuidRegex);
        uuids.add(uuid);
      }
      // All 100 UUIDs should be unique
      expect(uuids.size).toBe(100);
    });
  });

  describe("fallback behavior with getRandomValues only (Safari <15.4 simulation)", () => {
    let randomUUIDSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Make randomUUID undefined to simulate Safari <15.4
      randomUUIDSpy = vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
        throw new Error("Not supported");
      });
      // Override typeof check by mocking the property
      Object.defineProperty(crypto, "randomUUID", {
        value: undefined,
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      randomUUIDSpy.mockRestore();
    });

    it("should fall back to getRandomValues and generate a valid UUID v4", () => {
      const uuid = generateUUID();

      // Check that it matches UUID v4 format
      expect(uuid).toMatch(uuidRegex);

      // Verify it's 36 characters (8-4-4-4-12 format with dashes)
      expect(uuid.length).toBe(36);

      // Verify version bit is 4
      expect(uuid[14]).toBe("4");

      // Verify variant bits (should be 8, 9, a, or b)
      expect(["8", "9", "a", "b"]).toContain(uuid[19].toLowerCase());
    });

    it("should generate different UUIDs on subsequent calls", () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).toMatch(uuidRegex);
      expect(uuid2).toMatch(uuidRegex);
    });
  });
});
