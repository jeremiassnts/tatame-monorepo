import { db } from "@tatame-monorepo/db";
import { users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";

/** Service for role lookup and role-level checks. */
export class RolesService {
    constructor() { }

    /** Returns the role string for the given user id. Throws if user not found. */
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

    /** Returns true if the role is MANAGER. */
    isHigherRole(role: string) {
        return role === "MANAGER";
    }

    /** Returns true if the role is INSTRUCTOR or MANAGER. */
    isMediumRole(role: string) {
        return role === "INSTRUCTOR" || role === "MANAGER";
    }

    /** Returns true if the role is STUDENT. */
    isLowerRole(role: string) {
        return role === "STUDENT";
    }
}