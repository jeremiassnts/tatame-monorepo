/// <reference types="jest" />
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import {
  checkins,
  classTable,
  gyms,
  roles,
  users,
} from "@tatame-monorepo/db/schema";
import { db } from "@tatame-monorepo/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import { createApp } from "@/app";

const TEST_USER_ID = "test_e2e_checkins";
const today = new Date().toISOString().slice(0, 10);

describe("checkins (e2e)", () => {
  let app: ReturnType<typeof createApp>;
  let seedUser: { id: number };
  let seedClass: { id: number };

  beforeAll(async () => {
    await setupTestDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();

    await db.insert(roles).values([
      { id: "STUDENT" },
      { id: "MANAGER" },
    ]);

    const [user] = await db
      .insert(users)
      .values({
        clerkUserId: "clerk_checkins_e2e",
        role: "STUDENT",
        email: "checkins@test.com",
        firstName: "Checkin",
        lastName: "User",
        gymId: null,
        migratedAt: new Date(),
      })
      .returning();
    seedUser = user!;

    const [gym] = await db
      .insert(gyms)
      .values({
        name: "Test Gym",
        address: "Test Address",
        since: "2024-01-01",
        managerId: seedUser.id,
      })
      .returning();

    const [cls] = await db
      .insert(classTable)
      .values({
        gymId: gym!.id,
        day: "MONDAY",
        start: "18:00",
        end: "19:30",
        createdBy: seedUser.id,
      })
      .returning();
    seedClass = cls!;
  });

  const auth = () => ({ "X-Test-User-Id": TEST_USER_ID });

  describe("POST /api/checkins", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/checkins")
        .send({ userId: seedUser.id, classId: seedClass.id })
        .expect(401);
    });

    it("returns 400 when body invalid (missing userId)", async () => {
      await request(app)
        .post("/api/checkins")
        .set(auth())
        .send({ classId: seedClass.id })
        .expect(400);
    });

    it("creates checkin and returns 201", async () => {
      const res = await request(app)
        .post("/api/checkins")
        .set(auth())
        .send({
          userId: seedUser.id,
          classId: seedClass.id,
          date: today,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.created).toBe(true);

      const rows = await db
        .select()
        .from(checkins)
        .where(eq(checkins.userId, seedUser.id));
      expect(rows).toHaveLength(1);
      expect(rows[0]!.classId).toBe(seedClass.id);
      expect(rows[0]!.date).toBe(today);
    });

    it("is idempotent when same user+class already checked in", async () => {
      await db.insert(checkins).values({
        userId: seedUser.id,
        classId: seedClass.id,
        date: today,
      });

      const res = await request(app)
        .post("/api/checkins")
        .set(auth())
        .send({
          userId: seedUser.id,
          classId: seedClass.id,
          date: today,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.created).toBe(true);

      const rows = await db
        .select()
        .from(checkins)
        .where(eq(checkins.userId, seedUser.id));
      expect(rows).toHaveLength(1);
    });
  });

  describe("DELETE /api/checkins/:checkinId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).delete("/api/checkins/1").expect(401);
    });

    it("returns 400 when checkinId invalid", async () => {
      await request(app)
        .delete("/api/checkins/not-a-number")
        .set(auth())
        .expect(400);
    });

    it("deletes checkin and returns 200", async () => {
      const [c] = await db
        .insert(checkins)
        .values({
          userId: seedUser.id,
          classId: seedClass.id,
          date: today,
        })
        .returning();

      const res = await request(app)
        .delete(`/api/checkins/${c!.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("deleted");

      const rows = await db.select().from(checkins);
      expect(rows).toHaveLength(0);
    });
  });

  describe("GET /api/checkins/user/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get(`/api/checkins/user/${seedUser.id}`).expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .get("/api/checkins/user/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns empty list when no checkins", async () => {
      const res = await request(app)
        .get(`/api/checkins/user/${seedUser.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it("returns today's checkins for user", async () => {
      await db.insert(checkins).values({
        userId: seedUser.id,
        classId: seedClass.id,
        date: today,
      });

      const res = await request(app)
        .get(`/api/checkins/user/${seedUser.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].userId).toBe(seedUser.id);
      expect(res.body.data[0].classId).toBe(seedClass.id);
      expect(res.body.data[0].date).toBe(today);
    });
  });

  describe("GET /api/checkins/user/:userId/last", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/checkins/user/${seedUser.id}/last`)
        .expect(401);
    });

    it("returns last 15 days checkins", async () => {
      await db.insert(checkins).values({
        userId: seedUser.id,
        classId: seedClass.id,
        date: today,
      });

      const res = await request(app)
        .get(`/api/checkins/user/${seedUser.id}/last`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
    });
  });

  describe("GET /api/checkins/user/:userId/last-month", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/checkins/user/${seedUser.id}/last-month`)
        .expect(401);
    });

    it("returns last 30 days checkins with class info", async () => {
      await db.insert(checkins).values({
        userId: seedUser.id,
        classId: seedClass.id,
        date: today,
      });

      const res = await request(app)
        .get(`/api/checkins/user/${seedUser.id}/last-month`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty("class");
      expect(res.body.data[0].class).toMatchObject({
        id: seedClass.id,
        start: "18:00",
        end: "19:30",
        day: "MONDAY",
      });
    });
  });

  describe("GET /api/checkins/class/:classId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/checkins/class/${seedClass.id}`)
        .expect(401);
    });

    it("returns today's checkins for class with user names", async () => {
      await db.insert(checkins).values({
        userId: seedUser.id,
        classId: seedClass.id,
        date: today,
      });

      const res = await request(app)
        .get(`/api/checkins/class/${seedClass.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Checkin User");
      expect(res.body.data[0].userId).toBe(seedUser.id);
    });
  });

  describe("GET /api/checkins/class/:classId/user/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/checkins/class/${seedClass.id}/user/${seedUser.id}`)
        .expect(401);
    });

    it("returns today's checkins for class and user", async () => {
      await db.insert(checkins).values({
        userId: seedUser.id,
        classId: seedClass.id,
        date: today,
      });

      const res = await request(app)
        .get(`/api/checkins/class/${seedClass.id}/user/${seedUser.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userId).toBe(seedUser.id);
      expect(res.body.data[0].classId).toBe(seedClass.id);
    });
  });
});
