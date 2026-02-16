/// <reference types="jest" />
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import { gyms, roles, users } from "@tatame-monorepo/db/schema";
import { db } from "@tatame-monorepo/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import { createApp } from "@/app";

const TEST_USER_ID = "test_e2e_gyms";

describe("gyms (e2e)", () => {
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
        clerkUserId: "clerk_gyms_manager_e2e",
        role: "MANAGER",
        email: "manager@gym.com",
        firstName: "Gym",
        lastName: "Manager",
        gymId: null,
        approvedAt: new Date(),
        migratedAt: new Date(),
      })
      .returning();
    seedManager = manager!;

    const [student] = await db
      .insert(users)
      .values({
        clerkUserId: "clerk_gyms_student_e2e",
        role: "STUDENT",
        email: "student@gym.com",
        firstName: "Gym",
        lastName: "Student",
        gymId: null,
        migratedAt: new Date(),
      })
      .returning();
    seedStudent = student!;

    const [gym] = await db
      .insert(gyms)
      .values({
        name: "Test Gym",
        address: "123 Gym St",
        since: "2024-01-01",
        managerId: seedManager.id,
      })
      .returning();
    seedGym = gym!;

    await db
      .update(users)
      .set({ gymId: seedGym.id })
      .where(eq(users.id, seedManager.id));
  });

  const auth = () => ({ "X-Test-User-Id": TEST_USER_ID });

  describe("POST /api/gyms", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/gyms")
        .send({
          name: "New Gym",
          userId: seedManager.id,
        })
        .expect(401);
    });

    it("returns 400 when userId missing", async () => {
      await request(app)
        .post("/api/gyms")
        .set(auth())
        .send({
          name: "New Gym",
          address: "456 New St",
        })
        .expect(400);
    });

    it("returns 400 when name invalid (empty)", async () => {
      await request(app)
        .post("/api/gyms")
        .set(auth())
        .send({
          name: "",
          userId: seedManager.id,
        })
        .expect(400);
    });

    it("creates gym and returns 201", async () => {
      const managerWithoutGym = await db
        .insert(users)
        .values({
          clerkUserId: "clerk_new_gym_manager",
          role: "MANAGER",
          email: "newmanager@gym.com",
          firstName: "New",
          lastName: "Manager",
          gymId: null,
          approvedAt: new Date(),
          migratedAt: new Date(),
        })
        .returning();

      const res = await request(app)
        .post("/api/gyms")
        .set(auth())
        .send({
          name: "New Gym",
          address: "456 New St",
          since: "2024-06-01",
          userId: managerWithoutGym[0]!.id,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.created).toBe(true);
      expect(res.body.data.name).toBe("New Gym");
      expect(res.body.data.address).toBe("456 New St");
      expect(res.body.data.managerId).toBe(managerWithoutGym[0]!.id);

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, managerWithoutGym[0]!.id));
      expect(updatedUser?.gymId).toBe(res.body.data.id);
    });
  });

  describe("GET /api/gyms", () => {
    it("returns 401 when no auth", async () => {
      await request(app).get("/api/gyms").expect(401);
    });

    it("returns all gyms", async () => {
      const res = await request(app)
        .get("/api/gyms")
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.count).toBe(res.body.data.length);
      const gym = res.body.data.find((g: { id: number }) => g.id === seedGym.id);
      expect(gym).toBeDefined();
      expect(gym.name).toBe("Test Gym");
    });
  });

  describe("GET /api/gyms/user/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/gyms/user/${seedManager.id}`)
        .expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .get("/api/gyms/user/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns gym when user is manager", async () => {
      const res = await request(app)
        .get(`/api/gyms/user/${seedManager.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(seedGym.id);
      expect(res.body.data.name).toBe("Test Gym");
      expect(res.body.data.managerId).toBe(seedManager.id);
    });

    it("returns undefined when user is not manager of any gym", async () => {
      const res = await request(app)
        .get(`/api/gyms/user/${seedStudent.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeUndefined();
    });
  });

  describe("POST /api/gyms/associate", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/gyms/associate")
        .send({ gymId: seedGym.id, userId: seedStudent.id })
        .expect(401);
    });

    it("returns 400 when body invalid (missing gymId)", async () => {
      await request(app)
        .post("/api/gyms/associate")
        .set(auth())
        .send({ userId: seedStudent.id })
        .expect(400);
    });

    it("associates gym to user and returns 200", async () => {
      const res = await request(app)
        .post("/api/gyms/associate")
        .set(auth())
        .send({
          gymId: seedGym.id,
          userId: seedStudent.id,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("associated");

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, seedStudent.id));
      expect(updatedUser?.gymId).toBe(seedGym.id);
    });
  });
});
