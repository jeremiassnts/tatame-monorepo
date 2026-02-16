/// <reference types="jest" />
import { GraduationsService } from "@/services/graduations";

const mockFindFirst = jest.fn();
const mockReturning = jest.fn();
const mockWhere = jest.fn();
const mockSet = jest.fn();
const mockValues = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    update: () => ({ set: (...args: unknown[]) => mockSet(...args) }),
    query: {
      graduations: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
  },
}));

describe("GraduationsService", () => {
  const service = new GraduationsService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSet.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
  });

  describe("getGraduation", () => {
    it("returns graduation when found", async () => {
      const graduation = { id: 1, userId: 10, belt: "blue", degree: 2, modality: "BJJ", createdAt: new Date() };
      mockFindFirst.mockResolvedValueOnce(graduation);

      const result = await service.getGraduation(10);

      expect(mockFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.anything() }));
      expect(result).toEqual(graduation);
    });

    it("returns null when not found", async () => {
      mockFindFirst.mockResolvedValueOnce(undefined);

      const result = await service.getGraduation(999);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("creates a graduation and returns it", async () => {
      const input = { userId: 10, belt: "blue", degree: 1, modality: "BJJ" };
      const created = { id: 1, ...input, createdAt: new Date() };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      const mockInsert = jest.requireMock("@tatame-monorepo/db").db.insert;
      (mockInsert as jest.Mock).mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);

      const result = await service.create(input);

      expect(result).toEqual(created);
    });

    it("throws when create returns nothing", async () => {
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      const mockInsert = jest.requireMock("@tatame-monorepo/db").db.insert;
      (mockInsert as jest.Mock).mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([]);

      await expect(service.create({ userId: 1, belt: "white", degree: 0, modality: "BJJ" })).rejects.toThrow(
        "Failed to create graduation"
      );
    });
  });

  describe("update", () => {
    it("updates graduation by id", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.update({ id: 1, userId: 10, belt: "blue", degree: 2, modality: "BJJ", createdAt: new Date() });

      expect(mockSet).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
    });
  });
});
