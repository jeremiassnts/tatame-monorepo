/// <reference types="jest" />
import { ClassService } from "@/services/class";

const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockReturning = jest.fn();
const mockValues = jest.fn();
const mockSet = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockLeftJoin = jest.fn();

const mockCreateNotification = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    delete: jest.fn(),
    update: () => mockUpdate(),
    query: {},
  },
}));

jest.mock("@/services/notifications", () => ({
  NotificationsService: jest.fn().mockImplementation(() => ({
    create: mockCreateNotification,
  })),
}));

describe("ClassService", () => {
  const service = new ClassService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateNotification.mockResolvedValue({});
    mockUpdate.mockReturnValue({ set: (s: unknown) => ({ where: (...args: unknown[]) => mockWhere(...args) }) });
  });

  describe("nextClass", () => {
    it("returns null when no classes exist", async () => {
      const orderByResult = Promise.resolve([]);
      const selectChain = {
        from: () => ({
          leftJoin: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                where: () => ({
                  orderBy: () => orderByResult,
                }),
              }),
            }),
          }),
        }),
      };
      mockSelect.mockReturnValue(selectChain);

      const result = await service.nextClass(1);

      expect(result).toBeNull();
    });

    it("returns next class with instructor_name when classes exist", async () => {
      const now = new Date();
      const dayOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
      const futureTime = "23:00";
      const endTime = "23:30";
      const data = [
        {
          class: {
            id: 1,
            gymId: 1,
            instructorId: 1,
            day: dayOfWeek,
            start: futureTime,
            end: endTime,
            modality: "BJJ",
            description: null,
            createdAt: now,
            deletedAt: null,
            createdBy: null,
          },
          gyms: { name: "Gym A" },
          users: { firstName: "John", lastName: "Doe" },
          assets: null,
        },
      ];
      const orderByResult = Promise.resolve(data);
      const selectChain = {
        from: () => ({
          leftJoin: () => ({
            leftJoin: () => ({
              leftJoin: () => ({
                where: () => ({
                  orderBy: () => orderByResult,
                }),
              }),
            }),
          }),
        }),
      };
      mockSelect.mockReturnValue(selectChain);

      const result = await service.nextClass(1);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("instructor_name", "John Doe");
    });
  });

  describe("create", () => {
    it("creates class and sends notification to approved students", async () => {
      const classData = { gym_id: 1, instructor_id: 1, created_by: 1, day: "MONDAY", start: "18:00", end: "19:30", modality: "BJJ", description: null };
      const created = { id: 1, ...classData, gymId: 1, instructorId: 1, createdAt: new Date(), deletedAt: null, createdBy: 1 };
      const students = [{ id: 1, approvedAt: new Date(), role: "STUDENT", gymId: 1 }];

      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);
      mockWhere.mockResolvedValueOnce(students);

      const mockFromSelect = jest.fn();
      mockFromSelect.mockReturnValueOnce({ from: () => ({ where: (...args: unknown[]) => mockWhere(...args) }) });
      const selectCalls = mockSelect.mock.results;
      mockSelect.mockImplementation(() => {
        if (!selectCalls.length || mockFrom.mock.calls.length < 2) {
          return { from: () => ({ where: (...args: unknown[]) => mockWhere(...args) }) };
        }
        return { from: () => ({ where: (...args: unknown[]) => mockWhere(...args) }) };
      });

      const result = await service.create(classData);

      expect(result).toEqual(created);
      expect(mockCreateNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Nova aula criada",
          content: "Seu professor cadastrou uma nova aula, venha conferir!",
          channel: "push",
        })
      );
    });

    it("throws when create returns nothing", async () => {
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([]);

      await expect(
        service.create({ gym_id: 1, instructor_id: null, created_by: null, day: "MONDAY", start: "18:00", end: "19:30", modality: null, description: null })
      ).rejects.toThrow("Failed to create class");
    });
  });

  describe("edit", () => {
    it("throws when id is missing", async () => {
      await expect(service.edit({ id: 0 })).rejects.toThrow("O ID da aula é obrigatório");
    });

    it("updates class fields by id", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      const data = { id: 1, instructor_id: 2, day: "TUESDAY", start: "19:00", end: "20:00", description: "New" };
      const result = await service.edit(data);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  });

  describe("delete", () => {
    it("soft-deletes class by setting deletedAt", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.delete(1);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe("getToCheckIn", () => {
    it("returns class when time is within start and end", async () => {
      const cls = { id: 1, gymId: 1, day: "MONDAY", start: "18:00", end: "19:30" };
      mockWhere.mockResolvedValueOnce([cls]);

      const result = await service.getToCheckIn(1, "18:30", "MONDAY");

      expect(result).toEqual(cls);
    });

    it("returns null when no class matches", async () => {
      mockWhere.mockResolvedValueOnce([]);

      const result = await service.getToCheckIn(1, "20:00", "MONDAY");

      expect(result).toBeNull();
    });
  });
});
