/// <reference types="jest" />
import { createApp } from "@/app";
import { db } from "@tatame-monorepo/db";
import { gyms, roles, users } from "@tatame-monorepo/db/schema";
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import { eq } from "drizzle-orm";
import request from "supertest";

const TEST_USER_ID = "test_e2e_users";

describe("users (e2e)", () => {
  let app: ReturnType<typeof createApp>;
  let seedManager: { id: number };
  let seedStudent: { id: number };
  let seedGym: { id: number };

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

    const [manager] = await db
      .insert(users)
      .values({
        clerkUserId: "clerk_users_manager_e2e",
        role: "MANAGER",
        email: "manager@users.com",
        firstName: "Manager",
        lastName: "User",
        gymId: null,
        approvedAt: new Date(),
        migratedAt: new Date(),
      })
      .returning();
    seedManager = manager!;

    const [student] = await db
      .insert(users)
      .values({
        clerkUserId: "clerk_users_student_e2e",
        role: "STUDENT",
        email: "student@users.com",
        firstName: "Student",
        lastName: "User",
        gymId: null,
        approvedAt: null,
        deniedAt: null,
        migratedAt: new Date(),
      })
      .returning();
    seedStudent = student!;

    const [gym] = await db
      .insert(gyms)
      .values({
        name: "Users Test Gym",
        address: "Test Address",
        since: "2024-01-01",
        managerId: seedManager.id,
      })
      .returning();
    seedGym = gym!;

    await db.update(users).set({ gymId: seedGym.id }).where(eq(users.id, seedManager.id));
    await db.update(users).set({ gymId: seedGym.id }).where(eq(users.id, seedStudent.id));
  });

  const auth = () => ({ "X-Test-User-Id": TEST_USER_ID });

  describe("POST /api/users", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/users")
        .send({
          clerkUserId: "clerk_new",
          role: "STUDENT",
          email: "new@test.com",
          firstName: "New",
          lastName: "User",
        })
        .expect(401);
    });

    it("returns 400 when body invalid (missing email)", async () => {
      await request(app)
        .post("/api/users")
        .set(auth())
        .send({
          clerkUserId: "clerk_new",
          role: "STUDENT",
          firstName: "New",
          lastName: "User",
        })
        .expect(400);
    });

    it("creates user and returns 201", async () => {
      const res = await request(app)
        .post("/api/users")
        .set(auth())
        .send({
          clerkUserId: "clerk_new_user_123",
          role: "STUDENT",
          email: "newuser@test.com",
          firstName: "New",
          lastName: "User",
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.created).toBe(true);
      expect(res.body.data.clerkUserId).toBe("clerk_new_user_123");
      expect(res.body.data.email).toBe("newuser@test.com");
      expect(res.body.data.role).toBe("STUDENT");
      expect(res.body.data.approvedAt).toBeNull();
    });

    it("auto-approves when role is MANAGER", async () => {
      const res = await request(app)
        .post("/api/users")
        .set(auth())
        .send({
          clerkUserId: "clerk_new_manager",
          role: "MANAGER",
          email: "newmanager@test.com",
          firstName: "New",
          lastName: "Manager",
        })
        .expect(201);

      expect(res.body.data.approvedAt).not.toBeNull();
    });
  });

  describe("GET /api/users/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get(`/api/users/${seedManager.id}`).expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .get("/api/users/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns user by id", async () => {
      const res = await request(app)
        .get(`/api/users/${seedManager.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(seedManager.id);
      expect(res.body.data.email).toBe("manager@users.com");
    });

    it("returns undefined for non-existent user", async () => {
      const res = await request(app)
        .get("/api/users/99999")
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeUndefined();
    });
  });

  describe("GET /api/users/gym/:gymId/students", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/users/gym/${seedGym.id}/students`)
        .expect(401);
    });

    it("returns 400 when gymId invalid", async () => {
      await request(app)
        .get("/api/users/gym/invalid/students")
        .set(auth())
        .expect(400);
    });

    it("returns students for gym", async () => {
      const res = await request(app)
        .get(`/api/users/gym/${seedGym.id}/students`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const student = res.body.data.find((u: { role: string }) => u.role === "STUDENT");
      expect(student).toBeDefined();
    });
  });

  describe("GET /api/users/gym/:gymId/instructors", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/users/gym/${seedGym.id}/instructors`)
        .expect(401);
    });

    it("returns instructors for gym", async () => {
      const res = await request(app)
        .get(`/api/users/gym/${seedGym.id}/instructors`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      const manager = res.body.data.find((u: { role: string }) => u.role === "MANAGER");
      expect(manager).toBeDefined();
    });
  });

  describe("GET /api/users/birthdays/today", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get("/api/users/birthdays/today").expect(401);
    });

    it("returns birthday users (may be empty)", async () => {
      const res = await request(app)
        .get("/api/users/birthdays/today")
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("POST /api/users/approve", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/users/approve")
        .send({ userId: seedStudent.id })
        .expect(401);
    });

    it("returns 400 when userId missing", async () => {
      await request(app)
        .post("/api/users/approve")
        .set(auth())
        .send({})
        .expect(400);
    });

    it("approves student and returns 200", async () => {
      const res = await request(app)
        .post("/api/users/approve")
        .set(auth())
        .send({ userId: seedStudent.id })
        .expect(200);

      expect(res.body.success).toBe(true);

      const [updated] = await db
        .select()
        .from(users)
        .where(eq(users.id, seedStudent.id));
      expect(updated?.approvedAt).not.toBeNull();
      expect(updated?.deniedAt).toBeNull();
    });
  });

  describe("POST /api/users/deny", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/users/deny")
        .send({ userId: seedStudent.id })
        .expect(401);
    });

    it("denies student and returns 200", async () => {
      const res = await request(app)
        .post("/api/users/deny")
        .set(auth())
        .send({ userId: seedStudent.id })
        .expect(200);

      expect(res.body.success).toBe(true);

      const [updated] = await db
        .select()
        .from(users)
        .where(eq(users.id, seedStudent.id));
      expect(updated?.deniedAt).not.toBeNull();
      expect(updated?.approvedAt).toBeNull();
    });
  });

  describe("GET /api/users/:userId/approval-status", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/users/${seedStudent.id}/approval-status`)
        .expect(401);
    });

    it("returns approval status", async () => {
      const res = await request(app)
        .get(`/api/users/${seedManager.id}/approval-status`)
        .set(auth())
        .expect(200);

      expect(res.body.data.isApproved).toBe(true);
    });

    it("returns false for unapproved student", async () => {
      const res = await request(app)
        .get(`/api/users/${seedStudent.id}/approval-status`)
        .set(auth())
        .expect(200);

      expect(res.body.data.isApproved).toBe(false);
    });
  });

  describe("PUT /api/users/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .put(`/api/users/${seedStudent.id}`)
        .send({ first_name: "Updated" })
        .expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .put("/api/users/invalid")
        .set(auth())
        .send({ first_name: "Updated" })
        .expect(400);
    });

    it("updates user and returns 200", async () => {
      const res = await request(app)
        .put(`/api/users/${seedStudent.id}`)
        .set(auth())
        .send({
          first_name: "UpdatedFirst",
          last_name: "UpdatedLast",
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      const [updated] = await db
        .select()
        .from(users)
        .where(eq(users.id, seedStudent.id));
      expect(updated?.firstName).toBe("UpdatedFirst");
      expect(updated?.lastName).toBe("UpdatedLast");
    });
  });

  describe("DELETE /api/users/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app).delete(`/api/users/${seedStudent.id}`).expect(401);
    });

    it("soft-deletes user and returns 200", async () => {
      const res = await request(app)
        .delete(`/api/users/${seedStudent.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.success).toBe(true);

      const [deleted] = await db
        .select()
        .from(users)
        .where(eq(users.id, seedStudent.id));
      expect(deleted?.deletedAt).not.toBeNull();
    });
  });
});
