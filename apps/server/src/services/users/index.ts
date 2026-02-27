import { BELT_ORDER } from "@/constants/belt";
import { createClerkClient } from "@clerk/express";
import { db } from "@tatame-monorepo/db";
import { graduations, users } from "@tatame-monorepo/db/schema";
import { env } from "@tatame-monorepo/env/server";
import { format } from "date-fns";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
import { RolesService } from "../roles";

export interface MinimalProfileResponse {
    id: string;
    email: string | null;
    name: string | null;
    image_url: string;
}

type User = typeof users.$inferSelect;
type UserUpdate = Partial<Omit<User, "id">> & { id: number };

/** Service for user CRUD, approval workflow, and user listing by gym. */
export class UsersService {
    private rolesService: RolesService;
    private static readonly TIMESTAMP_KEYS = ["approvedAt", "deniedAt", "migratedAt", "deletedAt"] as const;

    constructor() {
        this.rolesService = new RolesService();
    }

    /** Creates a new user and auto-approves if role is MANAGER. */
    async create(clerkUserId: string, role: string, email: string, firstName: string, lastName: string, profilePicture: string) {
        const [user] = await db.insert(users).values({
            clerkUserId,
            role,
            email,
            firstName,
            lastName,
            profilePicture,
            approvedAt: this.rolesService.isHigherRole(role) ? new Date() : null,
            migratedAt: new Date(),
        }).returning();

        return user;
    }

    /** Returns the user by id, or undefined if not found. */
    async get(userId: number): Promise<User | undefined> {
        return await db.query.users.findFirst({
            where: eq(users.id, userId),
        });
    }

    /** Returns the user by Clerk user id, or undefined if not found. */
    async getByClerkUserId(clerkUserId: string): Promise<User | undefined> {
        return await db.query.users.findFirst({
            where: eq(users.clerkUserId, clerkUserId),
        });
    }

    /** Lists students for a gym with their graduations, sorted by belt, degree, and name. */
    async listStudentsByGymId(gymId: number) {
        // Fetch users with their graduations
        const studentsWithGraduations = await db
            .select({
                user: users,
                graduation: graduations,
            })
            .from(users)
            .leftJoin(graduations, eq(graduations.userId, users.id))
            .where(eq(users.gymId, gymId));

        // Transform to match expected format and sort
        const result = studentsWithGraduations.map(({ user, graduation }) => ({
            ...user,
            graduations: graduation ? {
                belt: graduation.belt,
                degree: graduation.degree,
            } : null,
            // Add belt and degree at root level for sorting (if graduation exists)
            belt: graduation?.belt,
            degree: graduation?.degree,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        }));

        // Sort by belt, degree, and name
        return result.sort((a, b) => {
            if (a.belt === b.belt) {
                if (a.degree === b.degree) {
                    return a.name.localeCompare(b.name);
                }
                return (b.degree ?? 0) - (a.degree ?? 0);
            }
            //@ts-ignore
            return (BELT_ORDER[a.belt] ?? 0) - (BELT_ORDER[b.belt] ?? 0);
        });
    }
    /** Returns true if the user is approved (or has a higher role that doesn't require approval). */
    async getStudentsApprovalStatus(userId: number): Promise<boolean> {
        const role = await this.rolesService.getRoleByUserId(userId);
        if (this.rolesService.isHigherRole(role ?? "")) {
            return true;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                approvedAt: true,
                deniedAt: true,
            },
        });

        if (!user) {
            return false;
        }

        return !!user.approvedAt && !user.deniedAt;
    }
    /** Updates user fields by id. */
    async update(data: UserUpdate): Promise<void> {
        const { id, ...updateData } = data;
        const normalized: Record<string, unknown> = { ...updateData };

        for (const key of UsersService.TIMESTAMP_KEYS) {
            const value = normalized[key];
            if (typeof value === "string") {
                normalized[key] = new Date(value);
            }
        }

        await db.update(users)
            .set(normalized)
            .where(eq(users.id, id));
    }
    /** Soft-deletes a user by setting deletedAt. */
    async delete(userId: string): Promise<void> {
        await db.update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, Number.parseInt(userId)));
    }

    /** Returns users whose birthDay (MM-DD) matches today's date. */
    async getBirthdayUsers() {
        const formatted = format(new Date(), "MM-dd");
        const birthdayUsers = await db
            .select()
            .from(users)
            .where(eq(users.birthDay, formatted));

        const result = birthdayUsers.sort((a, b) => {
            return (a.firstName ?? "").localeCompare(b.firstName ?? "");
        });
        return result;
    }

    /** Lists MANAGER and approved INSTRUCTOR users for the given gym. */
    async listInstructorsByGymId(gymId: number): Promise<User[]> {
        // MANAGER or INSTRUCTOR with approved_at not null
        const instructors = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.gymId, gymId),
                    or(
                        eq(users.role, "MANAGER"),
                        and(
                            eq(users.role, "INSTRUCTOR"),
                            isNotNull(users.approvedAt)
                        )
                    )
                )
            );

        return instructors;
    }

    /** Updates a Clerk user's profile image and returns a minimal payload. */
    async updateClerkProfileImage(
        clerkUserId: string,
        fileBuffer: Buffer,
        mimetype: string,
        filename: string,
    ): Promise<MinimalProfileResponse> {
        const clerk = createClerkClient({
            secretKey: env.CLERK_SECRET_KEY,
            publishableKey: env.CLERK_PUBLISHABLE_KEY,
        });

        const file = new File([fileBuffer], filename, { type: mimetype || "application/octet-stream" });
        const user = await clerk.users.updateUserProfileImage(clerkUserId, { file });

        const u = user as unknown as Record<string, unknown>;
        return {
            id: user.id,
            email: getPrimaryEmailFromClerk(u),
            name: getNameFromClerk(u),
            image_url: user.imageUrl ?? "",
        };
    }

    /** Finds users notification recipients by user id. */
    async findNotificationRecipients(recipientIds: number[]) {
        const recipients = await db
            .select({ expoPushToken: users.expoPushToken })
            .from(users)
            .where(inArray(users.id, recipientIds));

        return recipients;
    }
}

function getNameFromClerk(user: Record<string, unknown>): string | null {
    if (user?.full_name) return String(user.full_name);
    const first = (user?.first_name as string) ?? "";
    const last = (user?.last_name as string) ?? "";
    const combined = `${first} ${last}`.trim();
    return combined.length ? combined : null;
}

function getPrimaryEmailFromClerk(user: Record<string, unknown>): string | null {
    try {
        const primaryId = user?.primary_email_address_id as string | undefined;
        const emailAddrs = (user?.email_addresses as { id: string; email_address?: string }[] | undefined) ?? [];
        const emailObj = emailAddrs.find((e) => e.id === primaryId);
        return emailObj?.email_address ?? null;
    } catch {
        return null;
    }
}