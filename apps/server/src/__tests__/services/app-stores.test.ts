/// <reference types="jest" />
import { AppStoresService } from "@/services/app-stores";

const mockWhere = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    query: {},
  },
}));

describe("AppStoresService", () => {
  const service = new AppStoresService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect.mockReturnValue({
      from: () => mockFrom(),
    });
    mockFrom.mockReturnValue({
      where: (...args: unknown[]) => mockWhere(...args),
    });
  });

  describe("list", () => {
    it("returns all active app store entries", async () => {
      const mockStores = [
        { id: 1, store: "ios", url: "https://apple.com", createdAt: new Date(), disabledAt: null },
        { id: 2, store: "android", url: "https://play.google.com", createdAt: new Date(), disabledAt: null },
      ];
      mockWhere.mockResolvedValueOnce(mockStores);

      const result = await service.list();

      expect(mockSelect).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStores);
    });

    it("returns empty array when no active stores exist", async () => {
      mockWhere.mockResolvedValueOnce([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });
});
