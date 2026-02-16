/// <reference types="jest" />
import { VersionsService } from "@/services/versions";

// Mock the database
const mockFindFirst = jest.fn();
jest.mock("@tatame-monorepo/db", () => ({
  db: {
    query: {
      versions: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

describe("VersionsService", () => {
  const service = new VersionsService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("returns the latest active version when one exists", async () => {
      const mockVersion = {
        id: 3,
        appVersion: "1.2.3",
        createdAt: new Date("2024-01-15"),
        disabledAt: null,
      };

      mockFindFirst.mockResolvedValueOnce(mockVersion);

      const result = await service.get();

      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
          orderBy: expect.anything(),
        })
      );
      expect(result).toEqual(mockVersion);
    });

    it("throws 'No active version found' when no active version exists", async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);

      await expect(service.get()).rejects.toThrow("No active version found");
      expect(mockFindFirst).toHaveBeenCalledTimes(1);
    });

    it("throws when findFirst returns null", async () => {
      mockFindFirst.mockResolvedValueOnce(null);

      await expect(service.get()).rejects.toThrow("No active version found");
    });
  });
});
