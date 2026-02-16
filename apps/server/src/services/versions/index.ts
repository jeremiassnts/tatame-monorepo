import { db } from "@tatame-monorepo/db";
import { versions } from "@tatame-monorepo/db/schema";
import { desc, isNull } from "drizzle-orm";

/** Service for app version lookup (latest active version). */
export class VersionsService {
    constructor() { }

    /** Returns the latest active version (first by id where disabledAt is null). Throws if none found. */
    async get() {
        const version = await db.query.versions.findFirst({
            where: isNull(versions.disabledAt),
            orderBy: desc(versions.id),
        });

        if (!version) {
            throw new Error("No active version found");
        }

        return version;
    }
}