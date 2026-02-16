import { subDays } from "date-fns";
import { db } from "@tatame-monorepo/db";
import { checkins, users, classTable } from "@tatame-monorepo/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export class CheckinsService {
    constructor(accessToken: string) {
        // Access token kept for backward compatibility but not needed for Drizzle
    }

    /**
     * Create a checkin
     */
    async create(checkin: { classId: number | null; userId: number | null; date?: string | null }) {
        if (!checkin.classId || !checkin.userId) return;

        const existing = await db
            .select()
            .from(checkins)
            .where(
                and(
                    eq(checkins.classId, checkin.classId),
                    eq(checkins.userId, checkin.userId),
                ),
            );

        if (existing.length > 0) {
            return;
        }

        await db.insert(checkins).values({
            classId: checkin.classId,
            userId: checkin.userId,
            date: checkin.date ?? new Date().toISOString(),
        });
    }

    /**
     * Delete a checkin
     */
    async delete(checkinId: number) {
        const deleted = await db
            .delete(checkins)
            .where(eq(checkins.id, checkinId))
            .returning();
        return deleted;
    }

    /**
     * List checkins by user id (for today)
     */
    async listByUserId(userId: number) {
        const today = new Date().toISOString().split("T")[0];
        return await db
            .select()
            .from(checkins)
            .where(
                and(
                    eq(checkins.userId, userId),
                    eq(checkins.date, today),
                ),
            );
    }

    /**
     * List checkins by class id and user id (for today)
     */
    async listByClassIdAndUserId(classId: number, userId: number) {
        const today = new Date().toISOString().split("T")[0];
        return await db
            .select()
            .from(checkins)
            .where(
                and(
                    eq(checkins.userId, userId),
                    eq(checkins.date, today),
                    eq(checkins.classId, classId),
                ),
            );
    }

    /**
     * List last checkins by user id (last 15 days)
     */
    async listLastCheckinsByUserId(userId: number) {
        const fromDate = subDays(new Date(), 15).toISOString().split("T")[0];
        const toDate = new Date().toISOString().split("T")[0];

        return await db
            .select()
            .from(checkins)
            .where(
                and(
                    eq(checkins.userId, userId),
                    gte(checkins.date, fromDate),
                    lte(checkins.date, toDate),
                ),
            );
    }

    /**
     * List checkins by class id (for today, with user details)
     */
    async listByClassId(classId: number) {
        const today = new Date().toISOString().split("T")[0];

        const data = await db
            .select({
                checkin: checkins,
                firstName: users.firstName,
                lastName: users.lastName,
                profilePicture: users.profilePicture,
            })
            .from(checkins)
            .leftJoin(users, eq(checkins.userId, users.id))
            .where(
                and(
                    eq(checkins.classId, classId),
                    eq(checkins.date, today),
                ),
            );

        return data.map((row) => ({
            ...row.checkin,
            name: `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim(),
            imageUrl: row.profilePicture ?? "",
        }));
    }

    /**
     * List last month checkins by user id
     */
    async listLastMonthCheckinsByUserId(userId: number) {
        const fromDate = subDays(new Date(), 30).toISOString().split("T")[0];
        const toDate = new Date().toISOString().split("T")[0];

        const data = await db
            .select({
                checkin: checkins,
                classId: classTable.id,
                classStart: classTable.start,
                classEnd: classTable.end,
                classDay: classTable.day,
            })
            .from(checkins)
            .innerJoin(classTable, eq(checkins.classId, classTable.id))
            .where(
                and(
                    eq(checkins.userId, userId),
                    gte(checkins.date, fromDate),
                    lte(checkins.date, toDate),
                ),
            )
            .orderBy(desc(checkins.date));

        return data.map((row) => ({
            ...row.checkin,
            class: {
                id: row.classId,
                start: row.classStart,
                end: row.classEnd,
                day: row.classDay,
            },
        }));
    }
}
