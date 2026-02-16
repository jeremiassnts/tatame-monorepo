/// <reference types="jest" />
import { AssetsService } from "@/services/assets";

const mockReturning = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockValues = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockDelete = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    delete: () => mockDelete(),
    update: jest.fn(),
    query: {},
  },
}));

describe("AssetsService", () => {
  const service = new AssetsService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates an asset and returns the created row", async () => {
      const input = { class_id: 1, title: "Intro", content: "https://video.com", type: "video", valid_until: null };
      const created = { id: 1, classId: 1, title: "Intro", content: "https://video.com", type: "video", validUntil: null, createdAt: new Date() };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);

      const result = await service.create(input);

      expect(mockInsert).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it("parses valid_until as Date when provided", async () => {
      const input = { valid_until: "2025-12-31" };
      const created = { id: 1, validUntil: new Date("2025-12-31"), createdAt: new Date() };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);

      await service.create(input);

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ validUntil: new Date("2025-12-31") })
      );
    });
  });

  describe("delete", () => {
    it("deletes asset by id and returns deleted rows", async () => {
      const deleted = [{ id: 1, classId: 1, title: "Old", content: null, type: "video", validUntil: null, createdAt: new Date() }];
      mockWhere.mockReturnValue({ returning: () => mockReturning() });
      mockDelete.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
      mockReturning.mockResolvedValueOnce(deleted);

      const result = await service.delete(1);

      expect(mockWhere).toHaveBeenCalledWith(expect.anything());
      expect(result).toEqual(deleted);
    });
  });

  describe("listVideos", () => {
    it("returns videos ordered by createdAt desc", async () => {
      const videos = [
        { id: 1, type: "video", createdAt: new Date("2024-02-01"), title: "V1", content: null, classId: null, validUntil: null },
        { id: 2, type: "video", createdAt: new Date("2024-01-01"), title: "V2", content: null, classId: null, validUntil: null },
      ];
      mockOrderBy.mockResolvedValueOnce(videos);
      mockWhere.mockReturnValue({ orderBy: () => mockOrderBy() });
      mockFrom.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
      mockSelect.mockReturnValue({ from: () => mockFrom() });

      const result = await service.listVideos();

      expect(result).toEqual(videos);
    });
  });
});
