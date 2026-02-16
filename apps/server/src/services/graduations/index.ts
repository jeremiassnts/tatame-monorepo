import { db } from "@tatame-monorepo/db";
import { graduations } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

type Graduation = typeof graduations.$inferSelect;
type NewGraduation = typeof graduations.$inferInsert;
type GraduationUpdate = Partial<Omit<Graduation, "id">> & { id: number };

export class GraduationsService {
    constructor(accessToken: string) {
        // Access token kept for backward compatibility but not needed for Drizzle
    }
    
    /**
     * Get a graduation by user id
     */
    async getGraduation(userId: number): Promise<Graduation | null> {
        const graduation = await db.query.graduations.findFirst({
            where: eq(graduations.userId, userId),
        });
        
        return graduation ?? null;
    }
    
    /**
     * Create a graduation
     */
    async create(graduation: Omit<NewGraduation, "id" | "createdAt">): Promise<Graduation> {
        const [newGraduation] = await db.insert(graduations)
            .values(graduation)
            .returning();
        
        if (!newGraduation) {
            throw new Error("Failed to create graduation");
        }
        
        return newGraduation;
    }
    
    /**
     * Update a graduation
     */
    async update(graduation: GraduationUpdate): Promise<void> {
        const { id, ...updateData } = graduation;
        await db.update(graduations)
            .set(updateData)
            .where(eq(graduations.id, id));
    }
}