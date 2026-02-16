/// <reference types="jest" />
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import { graduations, roles, users } from "@tatame-monorepo/db/schema";
import { db } from "@tatame-monorepo/db";
import { eq } from "drizzle-orm";
import request from "supertest";
import { createApp } from "@/app";

const TEST_USER_ID = "test_e2e_graduations";

describe("graduations (e2e)", () => {
  let app: ReturnType<typeof createApp>;
  let seedUser: { id: number };
  let seedGraduation: { id: number };

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
        clerkUserId: "clerk_graduations_e2e",
        role: "STUDENT",
        email: "grad@test.com",
        firstName: "Grad",
        lastName: "User",
        gymId: null,
        migratedAt: new Date(),
      })
      .returning();
    seedUser = user!;

    const [grad] = await db
      .insert(graduations)
      .values({
        userId: seedUser.id,
        belt: "blue",
        degree: 2,
        modality: "BJJ",
      })
      .returning();
    seedGraduation = grad!;
  });

  const auth = () => ({ "X-Test-User-Id": TEST_USER_ID });

  describe("GET /api/graduations/user/:userId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .get(`/api/graduations/user/${seedUser.id}`)
        .expect(401);
    });

    it("returns 400 when userId invalid", async () => {
      await request(app)
        .get("/api/graduations/user/invalid")
        .set(auth())
        .expect(400);
    });

    it("returns graduation by user id", async () => {
      const res = await request(app)
        .get(`/api/graduations/user/${seedUser.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(seedGraduation.id);
      expect(res.body.data.userId).toBe(seedUser.id);
      expect(res.body.data.belt).toBe("blue");
      expect(res.body.data.degree).toBe(2);
      expect(res.body.data.modality).toBe("BJJ");
    });

    it("returns null when user has no graduation", async () => {
      await db.delete(graduations).where(eq(graduations.id, seedGraduation.id));

      const res = await request(app)
        .get(`/api/graduations/user/${seedUser.id}`)
        .set(auth())
        .expect(200);

      expect(res.body.data).toBeNull();
    });
  });

  describe("POST /api/graduations", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .post("/api/graduations")
        .send({
          userId: seedUser.id,
          belt: "white",
          degree: 0,
        })
        .expect(401);
    });

    it("returns 400 when body invalid (missing belt)", async () => {
      await request(app)
        .post("/api/graduations")
        .set(auth())
        .send({
          userId: seedUser.id,
          degree: 0,
        })
        .expect(400);
    });

    it("creates graduation and returns 201", async () => {
      await db.delete(graduations).where(eq(graduations.userId, seedUser.id));

      const res = await request(app)
        .post("/api/graduations")
        .set(auth())
        .send({
          userId: seedUser.id,
          belt: "purple",
          degree: 0,
          modality: "BJJ",
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.created).toBe(true);
      expect(res.body.data.belt).toBe("purple");
      expect(res.body.data.degree).toBe(0);
      expect(res.body.data.modality).toBe("BJJ");
    });
  });

  describe("PUT /api/graduations/:graduationId", () => {
    it("returns 401 when no auth", async () => {
      await request(app)
        .put(`/api/graduations/${seedGraduation.id}`)
        .send({ belt: "black" })
        .expect(401);
    });

    it("returns 400 when graduationId invalid", async () => {
      await request(app)
        .put("/api/graduations/invalid")
        .set(auth())
        .send({ belt: "black" })
        .expect(400);
    });

    it("updates graduation and returns 200", async () => {
      const res = await request(app)
        .put(`/api/graduations/${seedGraduation.id}`)
        .set(auth())
        .send({
          belt: "purple",
          degree: 1,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("updated");

      const [updated] = await db
        .select()
        .from(graduations)
        .where(eq(graduations.id, seedGraduation.id));
      expect(updated?.belt).toBe("purple");
      expect(updated?.degree).toBe(1);
    });
  });
});
