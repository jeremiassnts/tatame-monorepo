import { db } from "@tatame-monorepo/db";
import { assets, classTable, gyms, users } from "@tatame-monorepo/db/schema";
import { format, isBefore, set } from "date-fns";
import { and, eq, gte, isNull, lte } from "drizzle-orm";

const dayOfTheWeekOrder = [
    { name: "SUNDAY", order: 1 },
    { name: "MONDAY", order: 2 },
    { name: "TUESDAY", order: 3 },
    { name: "WEDNESDAY", order: 4 },
    { name: "THURSDAY", order: 5 },
    { name: "FRIDAY", order: 6 },
    { name: "SATURDAY", order: 7 },
];

/** Service for class schedule CRUD, next-class calculation, and check-in lookup. */
export class ClassService {
    constructor() { }
    /** Returns the next upcoming class for the gym (by day and start time), with instructor name and assets. */
    async nextClass(gymId: number) {
        const data = await db
            .select()
            .from(classTable)
            .leftJoin(gyms, eq(classTable.gymId, gyms.id))
            .leftJoin(users, eq(classTable.instructorId, users.id))
            .leftJoin(assets, eq(classTable.id, assets.classId))
            .where(
                and(
                    eq(classTable.gymId, gymId),
                    isNull(classTable.deletedAt),
                ),
            )

        if (data.length === 0) {
            return null;
        }

        const sortedData = data.sort((a, b) => {
            const aOrder = dayOfTheWeekOrder.find(item => item.name === a.class.day)?.order ?? 0;
            const bOrder = dayOfTheWeekOrder.find(item => item.name === b.class.day)?.order ?? 0;
            if (aOrder === bOrder) {
                const aClassTime = convertClassTimeToDate(a.class.start ?? "");
                const bClassTime = convertClassTimeToDate(b.class.start ?? "");
                return isBefore(aClassTime, bClassTime) ? -1 : 1;
            }
            return aOrder - bOrder;
        })

        const now = new Date();
        const dayOfTheWeek = format(now, "EEEE").toUpperCase();
        const todayDayOrder = dayOfTheWeekOrder.find(dto => dto.name === dayOfTheWeek)?.order ?? 0;
        let nextClass = sortedData.find(item => {
            const itemDayOrder = dayOfTheWeekOrder.find(dto => dto.name === item.class.day)?.order ?? 0;
            const itemClassTime = convertClassTimeToDate(item.class.end ?? "");
            return itemDayOrder >= todayDayOrder && isBefore(now, itemClassTime)
        })
        if (!nextClass) {
            nextClass = sortedData[0];
        }

        const instructor = (
            (nextClass?.users?.firstName ?? "") +
            " " +
            (nextClass?.users?.lastName ?? "")
        ).trim();

        return {
            ...nextClass?.class,
            instructorName: instructor,
            gym: nextClass?.gyms
        };
    }
    /** Creates a class and notifies approved students of the gym. */
    async create(classData: {
        gymId: number;
        instructorId: number | null;
        createdBy: number | null;
        day: string | null;
        start: string | null;
        end: string | null;
        modality: string | null;
        description: string | null;
    }) {
        const [created] = await db
            .insert(classTable)
            .values({
                gymId: classData.gymId,
                instructorId: classData.instructorId,
                createdBy: classData.createdBy,
                day: classData.day,
                start: classData.start,
                end: classData.end,
                modality: classData.modality,
                description: classData.description,
            })
            .returning();

        if (!created) {
            throw new Error("Failed to create class");
        }

        return created;
    }

    /** Lists all non-deleted classes for the gym with gym, instructor, and assets. */
    async list(gymId: number) {
        const data = await db
            .select()
            .from(classTable)
            .leftJoin(gyms, eq(classTable.gymId, gyms.id))
            .leftJoin(users, eq(classTable.instructorId, users.id))
            .leftJoin(assets, eq(assets.classId, classTable.id))
            .where(
                and(
                    eq(classTable.gymId, gymId),
                    isNull(classTable.deletedAt),
                ),
            )
            .orderBy(classTable.start);

        const classMap = new Map<
            number,
            {
                id: number;
                gymId: number | null;
                instructorId: number | null;
                createdBy: number | null;
                day: string | null;
                start: string | null;
                end: string | null;
                modality: string | null;
                description: string | null;
                createdAt: Date;
                deletedAt: Date | null;
                gym: { name: string } | null;
                instructor: { firstName: string | null; lastName: string | null } | null;
                assets: Array<{ id: number; content: string | null; type: string | null; validUntil: Date | null; createdAt: Date; title: string | null }>;
            }
        >();

        for (const row of data) {
            const c = row.class;
            const gym = row.gyms;
            const instructor = row.users;
            const asset = row.assets;

            if (!classMap.has(c.id)) {
                classMap.set(c.id, {
                    ...c,
                    gym: gym ? { name: gym.name } : null,
                    instructor: instructor
                        ? { firstName: instructor.firstName, lastName: instructor.lastName }
                        : null,
                    assets: [],
                });
            }

            if (asset) {
                const entry = classMap.get(c.id)!;
                if (!entry.assets.some((a) => a.id === asset.id)) {
                    entry.assets.push({
                        id: asset.id,
                        content: asset.content,
                        type: asset.type,
                        validUntil: asset.validUntil,
                        createdAt: asset.createdAt,
                        title: asset.title,
                    });
                }
            }
        }

        return Array.from(classMap.values()).map((item) => {
            const instructorName = item.instructor
                ? `${item.instructor.firstName ?? ""} ${item.instructor.lastName ?? ""}`.trim()
                : "";
            return {
                ...item,
                instructorName,
            };
        });
    }

    /** Returns a single class by id with instructor, gym, and assets, or null if not found. */
    async get(classId: number) {
        const data = await db
            .select()
            .from(classTable)
            .leftJoin(users, eq(classTable.instructorId, users.id))
            .leftJoin(gyms, eq(classTable.gymId, gyms.id))
            .leftJoin(assets, eq(assets.classId, classTable.id))
            .where(eq(classTable.id, classId));

        if (data.length === 0) {
            return null;
        }

        const classMap = new Map<
            number,
            {
                id: number;
                gymId: number | null;
                instructorId: number | null;
                createdBy: number | null;
                day: string | null;
                start: string | null;
                end: string | null;
                modality: string | null;
                description: string | null;
                createdAt: Date;
                deletedAt: Date | null;
                instructor: { firstName: string | null; lastName: string | null } | null;
                gym: { name: string; address: string } | null;
                assets: Array<{ id: number; content: string | null; type: string | null; validUntil: Date | null; createdAt: Date; title: string | null }>;
            }
        >();

        for (const row of data) {
            const c = row.class;
            const gym = row.gyms;
            const instructor = row.users;
            const asset = row.assets;

            if (!classMap.has(c.id)) {
                classMap.set(c.id, {
                    ...c,
                    instructor: instructor
                        ? { firstName: instructor.firstName, lastName: instructor.lastName }
                        : null,
                    gym: gym ? { name: gym.name, address: gym.address } : null,
                    assets: [],
                });
            }

            if (asset) {
                const entry = classMap.get(c.id)!;
                if (!entry.assets.some((a) => a.id === asset.id)) {
                    entry.assets.push({
                        id: asset.id,
                        content: asset.content,
                        type: asset.type,
                        validUntil: asset.validUntil,
                        createdAt: asset.createdAt,
                        title: asset.title,
                    });
                }
            }
        }

        const cls = Array.from(classMap.values())[0];
        const instructorName = cls?.instructor
            ? `${cls?.instructor.firstName ?? ""} ${cls?.instructor.lastName ?? ""}`.trim()
            : "";

        return {
            ...cls,
            instructorName,
        };
    }

    /** Updates class fields by id (instructorId, day, start, end, description). */
    async edit(data: {
        id: number;
        instructorId?: number;
        day?: string;
        start?: string;
        end?: string;
        description?: string;
    }) {
        if (!data.id) {
            throw new Error("O ID da aula é obrigatório");
        }
        const { id, ...rest } = data;
        const updateData: Record<string, unknown> = {};
        if (rest.instructorId !== undefined) updateData.instructorId = rest.instructorId;
        if (rest.day !== undefined) updateData.day = rest.day;
        if (rest.start !== undefined) updateData.start = rest.start;
        if (rest.end !== undefined) updateData.end = rest.end;
        if (rest.description !== undefined) updateData.description = rest.description;
        await db.update(classTable).set(updateData as Partial<typeof classTable.$inferInsert>).where(eq(classTable.id, id));
        return data;
    }

    /** Soft-deletes a class by setting deletedAt. */
    async delete(classId: number) {
        await db
            .update(classTable)
            .set({ deletedAt: new Date() })
            .where(eq(classTable.id, classId));
    }

    /** Returns the class that is currently in progress for the gym at the given day and time (start <= time <= end). */
    async getToCheckIn(gymId: number, time: string, day: string) {
        const [result] = await db
            .select()
            .from(classTable)
            .where(
                and(
                    eq(classTable.gymId, gymId),
                    eq(classTable.day, day),
                    lte(classTable.start, time),
                    gte(classTable.end, time),
                ),
            );

        return result ?? null;
    }
}

function convertClassTimeToDate(time: string) {
    return set(new Date(), {
        hours: Number(time.split(":")[0]),
        minutes: Number(time.split(":")[1]),
        seconds: 0,
        milliseconds: 0,
    });
}
