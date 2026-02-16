/// <reference types="jest" />
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import {
  classTable,
  gyms,
  roles,
  users,
} from "@tatame-monorepo/db/schema";
import { db } from "@tatame-monorepo/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import { createApp } from "@/app";

const TEST_USER_ID = "test_e2e_class";

describe("class (e2e)", () => {
  let app: ReturnType<typeof createApp>;
  let seedUser: { id: number };
  let seedGym: { id: number };
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

    await db.insert(roles).values([{ id: "STUDENT" }, { id: "MANAGER" }]);

    const [user] = await db
      .insert(users)
      .values({
        clerkUserId: "clerk_class_e2e",
        role: "MANAGER",
        email: "class@test.com",
        firstName: "Class",
        lastName: "Instructor",
        gymId: null,
        approvedAt: new Date(),
        migratedAt: new Date(),
      })
      .returning();
    seedUser = user!;

    const [gym] = await db
      .insert(gyms)
      .values({
        name: "Class Test Gym",
        address: "Test Address",
        since: "2024-01-01",
        managerId: seedUser.id,
      })
      .returning();
    seedGym = gym!;

    const [cls] = await db
      .insert(classTable)
      .values({
        gymId: seedGym.id,
        instructorId: seedUser.id,
        createdBy: seedUser.id,
        day: "MONDAY",
        start: "18:00",
        end: "19:30",
        description: "Test class",
      })
      .returning();
    seedClass = cls!;
  });

  const auth = () => ({ "X-Test-User-Id": TEST_USER_ID });

  describe("GET /api/class/next/:gymId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get(`/api/class/next/${seedGym.id}`).expect(401);
    });

    it("returns 400 when gymId invalid", async () => {
      await request(app)
        .get("/api/class/next/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns data (null or next class) for valid gymId", async () => {
      const res = await request(app)
        .get(`/api/class/next/${seedGym.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data === null || typeof res.body.data === "object").toBe(
        true
      );
      if (res.body.data) {
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("day");
        expect(res.body.data).toHaveProperty("start");
        expect(res.body.data).toHaveProperty("instructor_name");
      }
    });
  });

  describe("POST /api/class", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/class")
        .send({
          name: "New Class",
          gym_id: seedGym.id,
          instructor_id: seedUser.id,
          day: "TUESDAY",
          start: "19:00",
          end: "20:00",
        })
        .expect(401);
    });

    it("returns 400 when body invalid (missing gym_id)", async () => {
      await request(app)
        .post("/api/class")
        .set(auth())
        .send({
          name: "New Class",
          instructor_id: seedUser.id,
          day: "TUESDAY",
          start: "19:00",
          end: "20:00",
        })
        .expect(400);
    });

    it("creates class and returns 201", async () => {
      const res = await request(app)
        .post("/api/class")
        .set(auth())
        .send({
          name: "New Class",
          gym_id: seedGym.id,
          instructor_id: seedUser.id,
          created_by: seedUser.id,
          day: "WEDNESDAY",
          start: "19:00",
          end: "20:30",
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.created).toBe(true);
      expect(res.body.data.day).toBe("WEDNESDAY");
      expect(res.body.data.start).toBe("19:00");
      expect(res.body.data.end).toBe("20:30");
    });
  });

  describe("GET /api/class/gym/:gymId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get(`/api/class/gym/${seedGym.id}`).expect(401);
    });

    it("returns 400 when gymId invalid", async () => {
      await request(app)
        .get("/api/class/gym/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns classes for gym", async () => {
      const res = await request(app)
        .get(`/api/class/gym/${seedGym.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.count).toBe(res.body.data.length);
      const cls = res.body.data.find((c: { id: number }) => c.id === seedClass.id);
      expect(cls).toBeDefined();
      expect(cls.day).toBe("MONDAY");
      expect(cls.instructor_name).toBe("Class Instructor");
    });
  });

  describe("GET /api/class/:classId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get(`/api/class/${seedClass.id}`).expect(401);
    });

    it("returns 400 when classId invalid", async () => {
      await request(app)
        .get("/api/class/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns class by id", async () => {
      const res = await request(app)
        .get(`/api/class/${seedClass.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(seedClass.id);
      expect(res.body.data.day).toBe("MONDAY");
      expect(res.body.data.gym).toMatchObject({ name: "Class Test Gym" });
      expect(res.body.data.instructor_name).toBe("Class Instructor");
    });

    it("returns null for non-existent class", async () => {
      const res = await request(app)
        .get("/api/class/99999")
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeNull();
    });
  });

  describe("PUT /api/class/:classId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .put(`/api/class/${seedClass.id}`)
        .send({ description: "Updated" })
        .expect(401);
    });

    it("returns 400 when classId invalid", async () => {
      await request(app)
        .put("/api/class/invalid")
        .set(auth())
        .send({ description: "Updated" })
        .expect(400);
    });

    it("updates class and returns 200", async () => {
      const res = await request(app)
        .put(`/api/class/${seedClass.id}`)
        .set(auth())
        .send({
          start: "17:00",
          end: "18:30",
          description: "Updated description",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("updated");

      const [updated] = await db
        .select()
        .from(classTable)
        .where(eq(classTable.id, seedClass.id));
      expect(updated?.start).toBe("17:00");
      expect(updated?.end).toBe("18:30");
      expect(updated?.description).toBe("Updated description");
    });
  });

  describe("DELETE /api/class/:classId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).delete(`/api/class/${seedClass.id}`).expect(401);
    });

    it("returns 400 when classId invalid", async () => {
      await request(app)
        .delete("/api/class/invalid")
        .set(auth())
        .expect(400);
    });

    it("soft-deletes class and returns 200", async () => {
      const res = await request(app)
        .delete(`/api/class/${seedClass.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.success).toBe(true);

      const [deleted] = await db
        .select()
        .from(classTable)
        .where(eq(classTable.id, seedClass.id));
      expect(deleted?.deletedAt).not.toBeNull();
    });
  });

  describe("GET /api/class/check-in/available", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(
          `/api/class/check-in/available?gymId=${seedGym.id}&time=18:30&day=MONDAY`
        )
        .expect(401);
    });

    it("returns class in progress when time within start-end", async () => {
      const res = await request(app)
        .get(
          `/api/class/check-in/available?gymId=${seedGym.id}&time=18:30&day=MONDAY`
        )
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      if (res.body.data) {
        expect(res.body.data.id).toBe(seedClass.id);
        expect(res.body.data.start).toBe("18:00");
        expect(res.body.data.end).toBe("19:30");
      }
    });

    it("returns null when no class at given time", async () => {
      const res = await request(app)
        .get(
          `/api/class/check-in/available?gymId=${seedGym.id}&time=20:00&day=MONDAY`
        )
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeNull();
    });
  });
});
