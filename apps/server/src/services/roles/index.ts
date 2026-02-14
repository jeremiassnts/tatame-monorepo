import { db } from "@tatame-monorepo/db";
import { users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

export class RolesService {
    constructor(accessToken: string) {
        // Access token kept for backward compatibility but not needed for Drizzle
    }

    /*
    Get a role by user id
    */
    async getRoleByUserId(userId: number) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { role: true },
        });
        
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }
        
        return user.role;
    }

    /*
    Check the levels of the role
    */
    isHigherRole(role: string) {
        return role === "MANAGER";
    }

    isMediumRole(role: string) {
        return role === "INSTRUCTOR" || role === "MANAGER";
    }

    isLowerRole(role: string) {
        return role === "STUDENT";
    }
}