/// <reference types="jest" />
jest.mock("@tatame-monorepo/env/server", () => ({ env: {} }));
import { UsersService } from "@/services/users";
import { format, subDays } from "date-fns";

const mockFindFirstUsers = jest.fn();
const mockWhere = jest.fn();
const mockReturning = jest.fn();
const mockValues = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockLeftJoin = jest.fn();

const mockGetRoleByUserId = jest.fn();
const mockIsHigherRole = jest.fn();

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    select: () => mockSelect(),
    insert: () => mockInsert(),
    delete: jest.fn(),
    update: () => mockUpdate(),
    query: {
      users: {
        findFirst: (...args: unknown[]) => mockFindFirstUsers(...args),
      },
      gyms: { findFirst: jest.fn() },
      graduations: { findFirst: jest.fn() },
    },
  },
}));

jest.mock("@/services/roles", () => ({
  RolesService: jest.fn().mockImplementation(() => ({
    getRoleByUserId: mockGetRoleByUserId,
    isHigherRole: mockIsHigherRole,
  })),
}));

describe("UsersService", () => {
  const service = new UsersService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockReturnValue({
      set: (s: unknown) => ({ where: (...args: unknown[]) => mockWhere(...args) }),
    });
  });

  describe("create", () => {
    it("creates user and auto-approves when role is MANAGER", async () => {
      mockIsHigherRole.mockReturnValue(true);
      const created = {
        id: 1,
        clerkUserId: "clerk_1",
        role: "MANAGER",
        email: "m@test.com",
        firstName: "Manager",
        lastName: "User",
        profilePicture: null,
        approvedAt: new Date(),
        migratedAt: new Date(),
        createdAt: new Date(),
      };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);

      const result = await service.create("clerk_1", "MANAGER", "m@test.com", "Manager", "User", "");

      expect(result).toEqual(created);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ role: "MANAGER", approvedAt: expect.any(Date) })
      );
    });

    it("creates user without approval when role is not MANAGER", async () => {
      mockIsHigherRole.mockReturnValue(false);
      const created = {
        id: 2,
        clerkUserId: "clerk_2",
        role: "STUDENT",
        email: "s@test.com",
        firstName: "Student",
        lastName: "User",
        profilePicture: null,
        approvedAt: null,
        migratedAt: new Date(),
        createdAt: new Date(),
      };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);

      const result = await service.create("clerk_2", "STUDENT", "s@test.com", "Student", "User", "");

      expect(result).toEqual(created);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({ role: "STUDENT", approvedAt: null })
      );
    });
  });

  describe("get", () => {
    it("returns user when found", async () => {
      const user = { id: 1, clerkUserId: "clerk_1", role: "STUDENT", email: "u@test.com", firstName: "John", lastName: "Doe" };
      mockFindFirstUsers.mockResolvedValueOnce(user);

      const result = await service.get(1);

      expect(result).toEqual(user);
    });

    it("returns undefined when not found", async () => {
      mockFindFirstUsers.mockResolvedValueOnce(undefined);

      const result = await service.get(999);

      expect(result).toBeUndefined();
    });
  });

  describe("getByClerkUserId", () => {
    it("returns user when found", async () => {
      const user = { id: 1, clerkUserId: "clerk_123", role: "STUDENT" };
      mockFindFirstUsers.mockResolvedValueOnce(user);

      const result = await service.getByClerkUserId("clerk_123");

      expect(result).toEqual(user);
    });
  });

  describe("listStudentsByGymId", () => {
    it("returns students with graduations sorted by belt, degree, name", async () => {
      const rows = [
        { user: { id: 1, gymId: 1, firstName: "Alice", lastName: "A", belt: null, degree: null }, graduation: { belt: "blue", degree: 2 } },
        { user: { id: 2, gymId: 1, firstName: "Bob", lastName: "B", belt: null, degree: null }, graduation: { belt: "white", degree: 0 } },
      ];
      mockWhere.mockResolvedValueOnce(rows);
      mockLeftJoin.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
      mockFrom.mockReturnValue({ leftJoin: () => mockLeftJoin() });
      mockSelect.mockReturnValue({ from: () => mockFrom() });

      const result = await service.listStudentsByGymId(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("graduations");
      expect(result[0]).toHaveProperty("name");
    });
  });

  describe("approveStudent", () => {
    it("updates user to approved", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.approveStudent(1);

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("denyStudent", () => {
    it("updates user to denied", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.denyStudent(1);

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("getStudentsApprovalStatus", () => {
    it("returns true when role is MANAGER", async () => {
      mockGetRoleByUserId.mockResolvedValueOnce("MANAGER");
      mockIsHigherRole.mockReturnValue(true);

      const result = await service.getStudentsApprovalStatus(1);

      expect(result).toBe(true);
    });

    it("returns true when user is approved and not denied", async () => {
      mockGetRoleByUserId.mockResolvedValueOnce("STUDENT");
      mockIsHigherRole.mockReturnValue(false);
      mockFindFirstUsers.mockResolvedValueOnce({ approvedAt: new Date(), deniedAt: null });

      const result = await service.getStudentsApprovalStatus(1);

      expect(result).toBe(true);
    });

    it("returns false when user not found", async () => {
      mockGetRoleByUserId.mockResolvedValueOnce("STUDENT");
      mockIsHigherRole.mockReturnValue(false);
      mockFindFirstUsers.mockResolvedValueOnce(undefined);

      const result = await service.getStudentsApprovalStatus(999);

      expect(result).toBe(false);
    });

    it("returns false when user is denied", async () => {
      mockGetRoleByUserId.mockResolvedValueOnce("STUDENT");
      mockIsHigherRole.mockReturnValue(false);
      mockFindFirstUsers.mockResolvedValueOnce({ approvedAt: null, deniedAt: new Date() });

      const result = await service.getStudentsApprovalStatus(1);

      expect(result).toBe(false);
    });
  });

  describe("update", () => {
    it("updates user by id", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.update({ id: 1, firstName: "Updated", lastName: "Name" });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("soft-deletes user by setting deletedAt", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.delete("1");

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("getBirthdayUsers", () => {
    it("returns users with birthday today", async () => {
      const birthdayUsers = [
        { id: 1, birthDay: format(new Date(), "MM-dd"), firstName: "Alice", lastName: "A" },
        { id: 2, birthDay: format(subDays(new Date(), 1), "MM-dd"), firstName: "Bob", lastName: "B" },
      ];
      mockWhere.mockResolvedValueOnce(birthdayUsers);
      mockFrom.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
      mockSelect.mockReturnValue({ from: () => mockFrom() });

      const result = await service.getBirthdayUsers();

      expect(result).toHaveLength(2);
    });
  });

  describe("listInstructorsByGymId", () => {
    it("returns MANAGER and approved INSTRUCTOR users", async () => {
      const instructors = [
        { id: 1, gymId: 1, role: "MANAGER", approvedAt: new Date() },
        { id: 2, gymId: 1, role: "INSTRUCTOR", approvedAt: new Date() },
      ];
      mockWhere.mockResolvedValueOnce(instructors);
      mockFrom.mockReturnValue({ where: (...args: unknown[]) => mockWhere(...args) });
      mockSelect.mockReturnValue({ from: () => mockFrom() });

      const result = await service.listInstructorsByGymId(1);

      expect(result).toEqual(instructors);
    });
  });
});
