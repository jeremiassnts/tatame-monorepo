import { db } from "@tatame-monorepo/db";
import { gyms, users } from "@tatame-monorepo/db/schema";
import { and, eq } from "drizzle-orm";
import { NotificationsService } from "../notifications";
import { RolesService } from "../roles";

/** Service for gym CRUD and user–gym association. */
type NewGym = typeof gyms.$inferInsert;
type Gym = typeof gyms.$inferSelect;

export class GymsService {
    private rolesService: RolesService;
    private notificationsService: NotificationsService;

    constructor() {
        this.rolesService = new RolesService();
        this.notificationsService = new NotificationsService();
    }

    /**
     * Create a gym and associate it with the user
     */
    async create(gymData: Omit<NewGym, "id" | "createdAt">, userId: number): Promise<Gym> {
        // Insert gym
        const [gym] = await db.insert(gyms)
            .values(gymData)
            .returning();

        if (!gym) {
            throw new Error("Failed to create gym");
        }

        // Update user with gym_id
        await db.update(users)
            .set({ gymId: gym.id })
            .where(eq(users.id, userId));

        return gym;
    }

    /**
     * Get a gym by user id
     */
    async getByUserId(userId: number): Promise<Gym | undefined> {
        const gym = await db.query.gyms.findFirst({
            where: eq(gyms.managerId, userId),
        });
        return gym;
    }

    /**
     * Get all gyms
     */
    async list(): Promise<Gym[]> {
        return await db.select().from(gyms);
    }

    /**
     * Associate a gym to a user
     */
    async associate(gymId: number, userId: number): Promise<void> {
        // Update user's gym association
        const [updatedUser] = await db.update(users)
            .set({ gymId })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error("Failed to associate gym with user");
        }

        // Check if user is a higher role (INSTRUCTOR or MANAGER)
        const role = await this.rolesService.getRoleByUserId(userId);
        if (!this.rolesService.isHigherRole(role ?? "")) {
            // Find gym manager to notify
            const manager = await db.query.users.findFirst({
                where: and(
                    eq(users.gymId, gymId),
                    eq(users.role, "MANAGER")
                ),
            });

            if (manager) {
                await this.notificationsService.create({
                    title: "Novo aluno associado a academia",
                    content: `Verifique na lista de alunos para aprovar ou negar a associação`,
                    recipients: [manager.id.toString()],
                    channel: "push",
                    status: "pending",
                    viewed_by: [updatedUser.id.toString()],
                    sent_by: updatedUser.id,
                });
            }
        }
    }
}