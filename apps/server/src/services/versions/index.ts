import { db } from "@tatame-monorepo/db";
import { versions } from "@tatame-monorepo/db/schema";
import { isNull, desc } from "drizzle-orm";

export class VersionsService {
    constructor(accessToken: string) {
        // Access token kept for backward compatibility but not needed for Drizzle
    }

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