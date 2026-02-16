/// <reference types="jest" />
import { NotificationsService } from "@/services/notifications";

const mockWhere = jest.fn();
const mockReturning = jest.fn();
const mockOrderBy = jest.fn();
const mockValues = jest.fn();
const mockSet = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockLeftJoin = jest.fn();

const mockGetUser = jest.fn();
const mockIsHigherRole = jest.fn();

let selectImpl: (obj?: unknown) => unknown;

jest.mock("@tatame-monorepo/db", () => ({
  db: {
    get select() {
      return (obj?: unknown) => selectImpl?.(obj) ?? { from: () => ({ where: () => Promise.resolve([]) }) };
    },
    insert: () => mockInsert(),
    delete: jest.fn(),
    update: () => mockUpdate(),
    query: {},
  },
}));

jest.mock("@/services/roles", () => ({
  RolesService: jest.fn().mockImplementation(() => ({
    isHigherRole: mockIsHigherRole,
  })),
}));

jest.mock("@/services/users", () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    get: mockGetUser,
  })),
}));

describe("NotificationsService", () => {
  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService();
    selectImpl = () => ({ from: () => ({ where: () => Promise.resolve([]) }) });
    mockUpdate.mockReturnValue({
      set: (s: unknown) => {
        mockSet(s);
        return { where: (...args: unknown[]) => mockWhere(...args) };
      },
    });
    mockWhere.mockResolvedValue(undefined);
  });

  describe("create", () => {
    it("creates notification, sends it, and updates status", async () => {
      const notification = {
        title: "Test",
        content: "Content",
        recipients: ["1", "2"],
        channel: "push",
        sent_by: 1,
        status: "pending",
        viewed_by: [],
      };
      const created = { id: 1, ...notification, sentBy: 1, recipients: ["1", "2"], viewedBy: [], sentAt: null, createdAt: new Date() };
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([created]);
      mockWhere.mockResolvedValue([]);

      const result = await service.create(notification);

      expect(result).toEqual(created);
    });

    it("throws when insert returns nothing", async () => {
      mockValues.mockReturnValue({ returning: () => mockReturning() });
      mockInsert.mockReturnValue({ values: (v: unknown) => mockValues(v) });
      mockReturning.mockResolvedValueOnce([]);

      await expect(
        service.create({ title: "T", content: "C", recipients: [], channel: "push", sent_by: null, status: "pending", viewed_by: [] })
      ).rejects.toThrow("Failed to create notification");
    });
  });

  describe("listByUserId", () => {
    it("returns notifications with sender name and image", async () => {
      const rows = [
        {
          notification: { id: 1, title: "N1", content: "C1", sentBy: 2, recipients: [], channel: "push", status: "sent", viewedBy: [], sentAt: new Date(), createdAt: new Date() },
          senderFirstName: "Jane",
          senderLastName: "Doe",
          senderProfilePicture: "https://img.example.com/jane",
        },
      ];
      selectImpl = () => ({
        from: () => ({
          leftJoin: () => ({
            where: () => ({ orderBy: () => Promise.resolve(rows) }),
          }),
        }),
      });

      const result = await service.listByUserId(1);

      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          title: "N1",
          sent_by_name: "Jane Doe",
          sent_by_image_url: "https://img.example.com/jane",
        }),
      ]);
    });
  });

  describe("listUnreadByUserId", () => {
    it("returns empty when user not found", async () => {
      mockGetUser.mockResolvedValueOnce(null);

      const result = await service.listUnreadByUserId(999);

      expect(result).toEqual([]);
    });

    it("returns empty when user is not approved and not higher role", async () => {
      mockGetUser.mockResolvedValueOnce({ id: 1, role: "STUDENT", approvedAt: null });
      mockIsHigherRole.mockReturnValue(false);

      selectImpl = () => ({
        from: () => ({
          where: () => ({ orderBy: () => Promise.resolve([]) }),
        }),
      });

      const result = await service.listUnreadByUserId(1);

      expect(result).toEqual([]);
    });

    it("filters out read and sender notifications", async () => {
      mockGetUser.mockResolvedValueOnce({ id: 1, role: "MANAGER", approvedAt: new Date() });
      mockIsHigherRole.mockReturnValue(true);

      const notifications = [
        { id: 1, sentBy: 2, recipients: ["1"], viewedBy: [], title: "N1", content: "C1", channel: "push", status: "sent", createdAt: new Date() },
        { id: 2, sentBy: 1, recipients: ["1"], viewedBy: [], title: "N2", content: "C2", channel: "push", status: "sent", createdAt: new Date() },
      ];
      selectImpl = () => ({
        from: () => ({
          where: () => ({ orderBy: () => Promise.resolve(notifications) }),
        }),
      });

      const result = await service.listUnreadByUserId(1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe("update", () => {
    it("updates notification by id", async () => {
      mockWhere.mockResolvedValueOnce(undefined);

      await service.update({ id: 1, title: "Updated", status: "sent" });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("resend", () => {
    it("throws when notification not found", async () => {
      mockWhere.mockResolvedValueOnce([]);

      await expect(service.resend(999)).rejects.toThrow("Notification not found");
    });
  });

  describe("view", () => {
    it("does nothing when notification not found", async () => {
      mockWhere.mockResolvedValueOnce([]);

      await service.view(999, 1);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("does nothing when user already viewed", async () => {
      const notification = { id: 1, viewedBy: ["1"], sentBy: null, recipients: [], title: "", content: "", channel: "push", status: "sent", createdAt: new Date() };
      selectImpl = () => ({
        from: () => ({
          where: () => Promise.resolve([notification]),
        }),
      });

      await service.view(1, 1);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("appends userId to viewedBy when not viewed", async () => {
      const notification = { id: 1, viewedBy: [], sentBy: null, recipients: [], title: "", content: "", channel: "push", status: "sent", createdAt: new Date() };
      selectImpl = () => ({
        from: () => ({
          where: () => Promise.resolve([notification]),
        }),
      });
      mockWhere.mockResolvedValueOnce(undefined);

      await service.view(1, 1);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ viewedBy: ["1"] }));
    });
  });
});
