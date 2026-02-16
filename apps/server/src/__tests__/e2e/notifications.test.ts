/// <reference types="jest" />
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import { notifications, roles, users } from "@tatame-monorepo/db/schema";
import { db } from "@tatame-monorepo/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import { createApp } from "@/app";

const TEST_USER_ID = "test_e2e_notifications";

describe("notifications (e2e)", () => {
  let app: ReturnType<typeof createApp>;
  let seedUser: { id: number };
  let seedNotification: { id: number };

  beforeAll(async () => {
    await setupTestDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();

    await db.insert(roles).values([{ id: "STUDENT" }, { id: "MANAGER" }]);

    const [user] = await db
      .insert(users)
      .values({
        clerkUserId: "clerk_notifications_e2e",
        role: "MANAGER",
        email: "notif@test.com",
        firstName: "Notif",
        lastName: "Sender",
        gymId: null,
        approvedAt: new Date(),
        migratedAt: new Date(),
      })
      .returning();
    seedUser = user!;

    const [notif] = await db
      .insert(notifications)
      .values({
        title: "Test notification",
        content: "Test content",
        recipients: [seedUser.id.toString()],
        channel: "push",
        sentBy: seedUser.id,
        status: "pending",
        viewedBy: [],
      })
      .returning();
    seedNotification = notif!;
  });

  const auth = () => ({ "X-Test-User-Id": TEST_USER_ID });

  describe("POST /api/notifications", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/notifications")
        .send({
          title: "New",
          content: "Content",
          recipients: [seedUser.id.toString()],
          channel: "push",
        })
        .expect(401);
    });

    it("returns 400 when body invalid (missing title)", async () => {
      await request(app)
        .post("/api/notifications")
        .set(auth())
        .send({
          content: "Content",
          recipients: [],
          channel: "push",
        })
        .expect(400);
    });

    it("creates notification and returns 201", async () => {
      const res = await request(app)
        .post("/api/notifications")
        .set(auth())
        .send({
          title: "New notification",
          content: "New content",
          recipients: [seedUser.id.toString()],
          channel: "push",
          sent_by: seedUser.id,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.created).toBe(true);
      expect(res.body.data.title).toBe("New notification");
      expect(res.body.data.content).toBe("New content");
    });
  });

  describe("GET /api/notifications/user/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/notifications/user/${seedUser.id}`)
        .expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .get("/api/notifications/user/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns notifications for user", async () => {
      const res = await request(app)
        .get(`/api/notifications/user/${seedUser.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.count).toBe(res.body.data.length);
      const n = res.body.data.find(
        (x: { id: number }) => x.id === seedNotification.id
      );
      expect(n).toBeDefined();
      expect(n.title).toBe("Test notification");
    });
  });

  describe("GET /api/notifications/user/:userId/unread", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/notifications/user/${seedUser.id}/unread`)
        .expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .get("/api/notifications/user/invalid/unread")
        .set(auth())
        .expect(400);
    });

    it("returns unread notifications for user", async () => {
      const res = await request(app)
        .get(`/api/notifications/user/${seedUser.id}/unread`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeDefined();
    });
  });

  describe("PUT /api/notifications/:notificationId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .put(`/api/notifications/${seedNotification.id}`)
        .send({ title: "Updated" })
        .expect(401);
    });

    it("returns 400 when notificationId invalid", async () => {
      await request(app)
        .put("/api/notifications/invalid")
        .set(auth())
        .send({ title: "Updated" })
        .expect(400);
    });

    it("updates notification and returns 200", async () => {
      const res = await request(app)
        .put(`/api/notifications/${seedNotification.id}`)
        .set(auth())
        .send({
          title: "Updated title",
          content: "Updated content",
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      const [updated] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, seedNotification.id));
      expect(updated?.title).toBe("Updated title");
      expect(updated?.content).toBe("Updated content");
    });
  });

  describe("POST /api/notifications/:notificationId/resend", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post(`/api/notifications/${seedNotification.id}/resend`)
        .expect(401);
    });

    it("returns 400 when notificationId invalid", async () => {
      await request(app)
        .post("/api/notifications/invalid/resend")
        .set(auth())
        .expect(400);
    });

    it("resends notification and returns 200", async () => {
      const res = await request(app)
        .post(`/api/notifications/${seedNotification.id}/resend`)
        .set(auth())
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("resent");
    });
  });

  describe("POST /api/notifications/:notificationId/view", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post(`/api/notifications/${seedNotification.id}/view`)
        .send({ userId: seedUser.id })
        .expect(401);
    });

    it("returns 400 when notificationId invalid", async () => {
      await request(app)
        .post("/api/notifications/invalid/view")
        .set(auth())
        .send({ userId: seedUser.id })
        .expect(400);
    });

    it("marks notification as viewed and returns 200", async () => {
      const res = await request(app)
        .post(`/api/notifications/${seedNotification.id}/view`)
        .set(auth())
        .send({ userId: seedUser.id })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("viewed");

      const [updated] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, seedNotification.id));
      expect(updated?.viewedBy).toContain(seedUser.id.toString());
    });
  });
});
