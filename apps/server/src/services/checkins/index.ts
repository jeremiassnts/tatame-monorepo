import { db } from "@tatame-monorepo/db";
import { checkins, classTable, users } from "@tatame-monorepo/db/schema";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { CreateCheckinProps } from "./types";

/** Service for attendance check-ins by class and user. */
export class CheckinsService {
    constructor() { }

    /** Creates a check-in for the given class and user (today). No-op if one already exists. */
    async create(checkin: CreateCheckinProps) {
        const start = startOfDay(checkin.date);
        const end = endOfDay(checkin.date);
        const existing = await db
            .select()
            .from(checkins)
            .where(
                and(
                    eq(checkins.classId, checkin.classId),
                    eq(checkins.userId, checkin.userId),
                    gte(checkins.date, start.toISOString()),
                    lte(checkins.date, end.toISOString()),
                ),
            );

        if (existing.length > 0) {
            return;
        }

        await db.insert(checkins).values({
            classId: checkin.classId,
            userId: checkin.userId,
            date: checkin.date.toISOString(),
        });
    }

    /** Deletes a check-in by id and returns the deleted row(s). */
    async delete(checkinId: number) {
        const deleted = await db
            .delete(checkins)
            .where(eq(checkins.id, checkinId))
            .returning();
        return deleted;
    }

    /** Lists check-ins for the user for today. */
    async listByUserId(userId: number) {
        const today: string = new Date().toISOString().slice(0, 10);
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

    /** Lists check-ins for the given class and user for today. */
    async listByClassIdAndUserId(classId: number, userId: number) {
        const today: string = new Date().toISOString().slice(0, 10);
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

    /** Lists check-ins for the user in the last 15 days. */
    async listLastCheckinsByUserId(userId: number) {
        const fromDate = startOfDay(subDays(new Date(), 15))
        const toDate = new Date()

        return await db
            .select()
            .from(checkins)
            .where(
                and(
                    eq(checkins.userId, userId),
                    gte(checkins.date, fromDate.toISOString()),
                    lte(checkins.date, toDate.toISOString()),
                ),
            );
    }

    /** Lists today's check-ins for the class with user name and profile picture. */
    async listByClassId(classId: number, date: Date) {
        const start = startOfDay(date);
        const end = endOfDay(date);

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
                    gte(checkins.date, start.toISOString()),
                    lte(checkins.date, end.toISOString()),
                ),
            );

        return data.map((row) => ({
            ...row.checkin,
            name: `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim(),
            imageUrl: row.profilePicture ?? "",
        }));
    }

    /** Lists the user's check-ins in the last 30 days with class start, end, and day. */
    async listLastMonthCheckinsByUserId(userId: number) {
        const fromDate = startOfDay(subDays(new Date(), 30))
        const toDate = new Date()

        const data = await db
            .select({
                checkin: checkins,
                class: classTable
            })
            .from(checkins)
            .innerJoin(classTable, eq(checkins.classId, classTable.id))
            .where(
                and(
                    eq(checkins.userId, userId),
                    gte(checkins.date, fromDate.toISOString()),
                    lte(checkins.date, toDate.toISOString()),
                ),
            )
            .orderBy(desc(checkins.date));

        return data.map(row => ({
            ...row.checkin,
            class: row.class,
        }))
    }
}
