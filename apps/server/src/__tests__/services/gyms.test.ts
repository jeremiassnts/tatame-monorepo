/// <reference types="jest" />
import { GymsService } from "@/services/gyms";

const mockFindFirstGyms = jest.fn();
const mockFindFirstUsers = jest.fn();
const mockReturning = jest.fn();
const mockValues = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();

const mockGetRoleByUserId = jest.fn();
const mockIsHigherRole = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    delete: jest.fn(),
    update: () => mockUpdate(),
    query: {
      gyms: {
        findFirst: (...args: unknown[]) => mockFindFirstGyms(...args),
      },
      users: {
        findFirst: (...args: unknown[]) => mockFindFirstUsers(...args),
      },
    },
  },
}));

jest.mock("@/services/roles", () => ({
  RolesService: jest.fn().mockImplementation(() => ({
    getRoleByUserId: mockGetRoleByUserId,
    isHigherRole: mockIsHigherRole,
  })),
}));

describe("GymsService", () => {
  const service = new GymsService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => mockReturning(),
        }),
      }),
    });
  });

  describe("create", () => {
    it("creates gym, updates user with gymId, and returns gym", async () => {
      const gymData = { name: "Gym A", address: "123 Main St", logo: null, managerId: null, since: "2020-01-01" };
      const created = { id: 1, ...gymData, createdAt: new Date() };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);

      const result = await service.create(gymData, 1);

      expect(result).toEqual(created);
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it("throws when insert returns nothing", async () => {
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([]);

      await expect(
        service.create({ name: "Gym", address: "Addr", logo: null, managerId: null, since: "2020" }, 1)
      ).rejects.toThrow("Failed to create gym");
    });
  });

  describe("getByUserId", () => {
    it("returns gym when found by manager id", async () => {
      const gym = { id: 1, name: "Gym A", address: "123 Main", managerId: 1, since: "2020", createdAt: new Date(), logo: null };
      mockFindFirstGyms.mockResolvedValueOnce(gym);

      const result = await service.getByUserId(1);

      expect(result).toEqual(gym);
    });

    it("returns undefined when not found", async () => {
      mockFindFirstGyms.mockResolvedValueOnce(undefined);

      const result = await service.getByUserId(999);

      expect(result).toBeUndefined();
    });
  });

  describe("list", () => {
    it("returns all gyms", async () => {
      const gymsList = [
        { id: 1, name: "Gym A", address: "123 Main", managerId: 1, since: "2020", createdAt: new Date(), logo: null },
        { id: 2, name: "Gym B", address: "456 Oak", managerId: 2, since: "2021", createdAt: new Date(), logo: null },
      ];
      mockFrom.mockResolvedValueOnce(gymsList);
      mockSelect.mockReturnValue({ from: () => mockFrom() });

      const result = await service.list();

      expect(result).toEqual(gymsList);
    });
  });

  describe("associate", () => {
    it("associates gym to user", async () => {
      const updatedUser = { id: 5, gymId: 1, role: "STUDENT" };
      const manager = { id: 1, gymId: 1, role: "MANAGER" };
      mockReturning.mockResolvedValue([updatedUser]);
      mockGetRoleByUserId.mockResolvedValueOnce("STUDENT");
      mockIsHigherRole.mockReturnValue(false);
      mockFindFirstUsers.mockResolvedValueOnce(manager);

      await service.associate(1, 5);

      expect(mockUpdate).toHaveBeenCalled();
    });

    it("associates gym to user when user is MANAGER", async () => {
      const updatedUser = { id: 1, gymId: 1, role: "MANAGER" };
      mockReturning.mockResolvedValue([updatedUser]);
      mockGetRoleByUserId.mockResolvedValueOnce("MANAGER");
      mockIsHigherRole.mockReturnValue(true);

      await service.associate(1, 1);

      expect(mockUpdate).toHaveBeenCalled();
    });

    it("throws when update returns no user", async () => {
      mockReturning.mockResolvedValue([]);

      await expect(service.associate(1, 999)).rejects.toThrow("Failed to associate gym with user");
    });

    it("associates when no manager found", async () => {
      const updatedUser = { id: 5, gymId: 1, role: "STUDENT" };
      mockReturning.mockResolvedValue([updatedUser]);
      mockGetRoleByUserId.mockResolvedValueOnce("STUDENT");
      mockIsHigherRole.mockReturnValue(false);
      mockFindFirstUsers.mockResolvedValueOnce(undefined);

      await service.associate(1, 5);

      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
