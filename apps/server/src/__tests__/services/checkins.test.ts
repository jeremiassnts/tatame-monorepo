/// <reference types="jest" />
import { CheckinsService } from "@/services/checkins";

const mockWhere = jest.fn();
const mockValues = jest.fn();
const mockReturning = jest.fn();
const mockOrderBy = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockLeftJoin = jest.fn();
const mockInnerJoin = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: (obj?: unknown) => (obj ? mockSelect(obj) : mockSelect()),
    insert: () => mockInsert(),
    delete: () => mockDelete(),
    update: jest.fn(),
    query: {},
  },
}));

describe("CheckinsService", () => {
  const service = new CheckinsService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({
      where: (...args: unknown[]) => mockWhere(...args),
      leftJoin: () => mockLeftJoin(),
      innerJoin: () => mockInnerJoin(),
      orderBy: () => mockOrderBy(),
    });
    mockSelect.mockReturnValue({ from: () => mockFrom() });
    mockLeftJoin.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
    mockInnerJoin.mockReturnValue({
      where: (...args: unknown[]) => mockWhere(...args),
      orderBy: () => mockOrderBy(),
    });
    mockOrderBy.mockResolvedValue([]);
    mockWhere.mockResolvedValue([]);
  });

  describe("create", () => {
    it("returns early when classId is null", async () => {
      await service.create({ classId: null, userId: 1 });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("returns early when userId is null", async () => {
      await service.create({ classId: 1, userId: null });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("returns early when check-in already exists", async () => {
      mockWhere.mockResolvedValueOnce([{ id: 1, classId: 1, userId: 1, date: "2024-01-15", createdAt: new Date() }]);

      await service.create({ classId: 1, userId: 1 });

      expect(mockWhere).toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it("inserts check-in when none exists", async () => {
      mockWhere.mockResolvedValueOnce([]);
      mockValues.mockReturnValue(undefined);
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });

      await service.create({ classId: 1, userId: 1 });

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ classId: 1, userId: 1 })
      );
    });
  });

  describe("delete", () => {
    it("deletes check-in by id and returns deleted rows", async () => {
      const deleted = [{ id: 1, classId: 1, userId: 1, date: "2024-01-15", createdAt: new Date() }];
      mockWhere.mockReturnValue({ returning: () => mockReturning() });
      mockDelete.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
      mockReturning.mockResolvedValueOnce(deleted);

      const result = await service.delete(1);

      expect(result).toEqual(deleted);
    });
  });

  describe("listByUserId", () => {
    it("returns check-ins for user for today", async () => {
      const checkins = [{ id: 1, userId: 1, classId: 1, date: "2024-02-15", createdAt: new Date() }];
      mockWhere.mockResolvedValueOnce(checkins);

      const result = await service.listByUserId(1);

      expect(result).toEqual(checkins);
    });
  });

  describe("listByClassIdAndUserId", () => {
    it("returns check-ins for class and user for today", async () => {
      const checkins = [{ id: 1, userId: 1, classId: 5, date: "2024-02-15", createdAt: new Date() }];
      mockWhere.mockResolvedValueOnce(checkins);

      const result = await service.listByClassIdAndUserId(5, 1);

      expect(result).toEqual(checkins);
    });
  });

  describe("listLastCheckinsByUserId", () => {
    it("returns check-ins in last 15 days", async () => {
      const checkins = [
        { id: 1, userId: 1, classId: 1, date: "2024-02-10", createdAt: new Date() },
      ];
      mockWhere.mockResolvedValueOnce(checkins);

      const result = await service.listLastCheckinsByUserId(1);

      expect(result).toEqual(checkins);
    });
  });

  describe("listByClassId", () => {
    it("returns check-ins with user name and image", async () => {
      const data = [
        {
          checkin: { id: 1, userId: 1, classId: 1, date: "2024-02-15", createdAt: new Date() },
          firstName: "John",
          lastName: "Doe",
          profilePicture: "https://img.example.com/1",
        },
      ];
      mockWhere.mockResolvedValueOnce(data);

      const result = await service.listByClassId(1);

      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          userId: 1,
          classId: 1,
          name: "John Doe",
          imageUrl: "https://img.example.com/1",
        }),
      ]);
    });
  });

  describe("listLastMonthCheckinsByUserId", () => {
    it("returns check-ins with class info", async () => {
      const data = [
        {
          checkin: { id: 1, userId: 1, classId: 1, date: "2024-02-01", createdAt: new Date() },
          classId: 1,
          classStart: "18:00",
          classEnd: "19:30",
          classDay: "MONDAY",
        },
      ];
      mockWhere.mockReturnValue({ orderBy: () => mockOrderBy() });
      mockOrderBy.mockResolvedValueOnce(data);

      const result = await service.listLastMonthCheckinsByUserId(1);

      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          userId: 1,
          classId: 1,
          class: { id: 1, start: "18:00", end: "19:30", day: "MONDAY" },
        }),
      ]);
    });
  });
});
