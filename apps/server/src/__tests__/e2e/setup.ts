/**
 * E2E test setup. Runs before any E2E test file.
 * - Sets NODE_ENV to test
 * - Points DATABASE_URL to test database so app services use it
 * - Mocks env to avoid loading @t3-oss/env-core (ESM) in Jest
 */
const testDbUrl =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres:password@localhost:5432/tatame_test";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = testDbUrl;

// Mock env before any imports that use it (auth, etc.)
jest.mock("@tatame-monorepo/env/server", () => ({
  env: {
    DATABASE_URL: testDbUrl,
    CORS_ORIGIN: "http://localhost:3000",
    NODE_ENV: "test",
    STRIPE_SECRET_KEY: "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
    CLERK_PUBLISHABLE_KEY: "pk_test_mock",
    CLERK_SECRET_KEY: "sk_test_mock",
    PORT: 3000,
    RESEND_API_KEY: "re_mock",
  },
}));

// Mock Clerk middleware for E2E - avoids real key validation; requireAuth handles X-Test-User-Id bypass
jest.mock("@clerk/express", () => ({
  clerkMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  getAuth: () => null,
}));

// Break circular dependency: NotificationsService -> UsersService -> NotificationsService
// Mock UsersService with real DB ops (no NotificationsService dep) so all E2E routes work
jest.mock("@/services/users", () => {
  const { db } = jest.requireActual("@tatame-monorepo/db");
  const { users, graduations } = jest.requireActual("@tatame-monorepo/db/schema");
  const { and, eq, isNotNull, or } = jest.requireActual("drizzle-orm");
  const { RolesService } = jest.requireActual("@/services/roles");
  const rolesService = new RolesService();
  return {
    UsersService: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockImplementation((id: number) => db.query.users.findFirst({ where: eq(users.id, id) })),
      create: jest.fn().mockImplementation(async (_c: string, _r: string, email: string, firstName: string, lastName: string) => {
        const [u] = await db.insert(users).values({
          clerkUserId: _c,
          role: _r,
          email,
          firstName,
          lastName,
          approvedAt: rolesService.isHigherRole(_r) ? new Date() : null,
          migratedAt: new Date(),
        }).returning();
        return u;
      }),
      getByClerkUserId: jest.fn().mockImplementation((clerkId: string) => db.query.users.findFirst({ where: eq(users.clerkUserId, clerkId) })),
      listStudentsByGymId: jest.fn().mockImplementation(async (gymId: number) => {
        const rows = await db.select({ user: users, graduation: graduations })
          .from(users).leftJoin(graduations, eq(graduations.userId, users.id))
          .where(eq(users.gymId, gymId));
        return rows.map((r: any) => ({ ...r.user, graduations: r.graduation ? { belt: r.graduation.belt, degree: r.graduation.degree } : null, name: `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim() }));
      }),
      listInstructorsByGymId: jest.fn().mockImplementation((gymId: number) => db.select().from(users).where(and(eq(users.gymId, gymId), or(eq(users.role, "MANAGER"), and(eq(users.role, "INSTRUCTOR"), isNotNull(users.approvedAt)))))),
      getBirthdayUsers: jest.fn().mockResolvedValue([]),
      approveStudent: jest.fn().mockImplementation((userId: number) => db.update(users).set({ approvedAt: new Date(), deniedAt: null }).where(eq(users.id, userId))),
      denyStudent: jest.fn().mockImplementation((userId: number) => db.update(users).set({ deniedAt: new Date(), approvedAt: null }).where(eq(users.id, userId))),
      getStudentsApprovalStatus: jest.fn().mockImplementation(async (userId: number) => {
        const [u] = await db.select().from(users).where(eq(users.id, userId));
        if (!u) return false;
        if (rolesService.isHigherRole(u.role ?? "")) return true;
        return !!(u.approvedAt && !u.deniedAt);
      }),
      update: jest.fn().mockImplementation(async (data: { id: number } & Record<string, unknown>) => {
        const { id, ...rest } = data;
        await db.update(users).set(rest).where(eq(users.id, id));
      }),
      delete: jest.fn().mockImplementation((userId: string) => db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, parseInt(userId, 10)))),
    })),
  };
});
