/// <reference types="jest" />
import { RolesService } from "@/services/roles";

const mockFindFirst = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    query: {
      users: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

describe("RolesService", () => {
  const service = new RolesService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRoleByUserId", () => {
    it("returns role when user exists", async () => {
      mockFindFirst.mockResolvedValueOnce({ role: "INSTRUCTOR" });

      const result = await service.getRoleByUserId(1);

      expect(result).toBe("INSTRUCTOR");
    });

    it("throws when user not found", async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);

      await expect(service.getRoleByUserId(999)).rejects.toThrow("User with id 999 not found");
    });
  });

  describe("isHigherRole", () => {
    it("returns true for MANAGER", () => {
      expect(service.isHigherRole("MANAGER")).toBe(true);
    });
    it("returns false for other roles", () => {
      expect(service.isHigherRole("INSTRUCTOR")).toBe(false);
      expect(service.isHigherRole("STUDENT")).toBe(false);
    });
  });

  describe("isMediumRole", () => {
    it("returns true for INSTRUCTOR and MANAGER", () => {
      expect(service.isMediumRole("INSTRUCTOR")).toBe(true);
      expect(service.isMediumRole("MANAGER")).toBe(true);
    });
    it("returns false for STUDENT", () => {
      expect(service.isMediumRole("STUDENT")).toBe(false);
    });
  });

  describe("isLowerRole", () => {
    it("returns true for STUDENT", () => {
      expect(service.isLowerRole("STUDENT")).toBe(true);
    });
    it("returns false for INSTRUCTOR and MANAGER", () => {
      expect(service.isLowerRole("INSTRUCTOR")).toBe(false);
      expect(service.isLowerRole("MANAGER")).toBe(false);
    });
  });
});
