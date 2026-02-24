import { db } from "@tatame-monorepo/db";
import { gyms, users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

/** Service for gym CRUD and user–gym association. */
type NewGym = typeof gyms.$inferInsert;
type Gym = typeof gyms.$inferSelect;
type GymUpdate = Partial<Omit<Gym, "id">> & { id: number };
export class GymsService {
    constructor() { }
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
        return gym
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
    }
    /** Get gym by id. */
    async getById(gymId: number): Promise<Gym | undefined> {
        return await db.query.gyms.findFirst({
            where: eq(gyms.id, gymId),
        });
    }
    /** Update gym */
    async update(data: GymUpdate): Promise<void> {
        const { id, ...updateData } = data;
        await db.update(gyms)
            .set(updateData)
            .where(eq(gyms.id, id));
    }
}