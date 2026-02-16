/// <reference types="jest" />
import {
  clearTestData,
  setupTestDatabase,
  teardownTestDatabase,
} from "@tatame-monorepo/db/test-utils";
import { versions } from "@tatame-monorepo/db/schema";
import { db } from "@tatame-monorepo/db";
import request from "supertest";
import { createApp } from "@/app";

const TEST_USER_ID = "test_e2e_user_1";

describe("versions (e2e)", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    await setupTestDatabase();
    app = createApp();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  describe("GET /api/versions", () => {
    it("returns 401 when no auth header", async () => {
      await request(app)
        .get("/api/versions")
        .expect(401)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
          expect(res.body.error.code).toBe("UNAUTHORIZED");
        });
    });

    it("returns 401 when missing X-Test-User-Id in test env", async () => {
      await request(app)
        .get("/api/versions")
        .set("Authorization", "Bearer invalid")
        .expect(401);
    });

    it("returns 500 when no active version exists", async () => {
      await request(app)
        .get("/api/versions")
        .set("X-Test-User-Id", TEST_USER_ID)
        .expect(500);
    });

    it("returns latest active version when one exists", async () => {
      const [inserted] = await db
        .insert(versions)
        .values({ appVersion: "1.2.3" })
        .returning();

      const res = await request(app)
        .get("/api/versions")
        .set("X-Test-User-Id", TEST_USER_ID)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(inserted?.id);
      expect(res.body.data.appVersion).toBe("1.2.3");
      expect(res.body.data.disabledAt).toBeNull();
    });

    it("returns newest version when multiple active versions exist", async () => {
      await db.insert(versions).values({ appVersion: "1.0.0" }).returning();
      const [newer] = await db
        .insert(versions)
        .values({ appVersion: "2.0.0" })
        .returning();

      const res = await request(app)
        .get("/api/versions")
        .set("X-Test-User-Id", TEST_USER_ID)
        .expect(200);

      expect(res.body.data.appVersion).toBe("2.0.0");
      expect(res.body.data.id).toBe(newer?.id);
    });

    it("ignores disabled versions", async () => {
      const [active] = await db
        .insert(versions)
        .values({ appVersion: "1.0.0" })
        .returning();
      await db
        .insert(versions)
        .values({ appVersion: "2.0.0", disabledAt: new Date() })
        .returning();

      const res = await request(app)
        .get("/api/versions")
        .set("X-Test-User-Id", TEST_USER_ID)
        .expect(200);

      expect(res.body.data.appVersion).toBe("1.0.0");
      expect(res.body.data.id).toBe(active?.id);
    });
  });
});
