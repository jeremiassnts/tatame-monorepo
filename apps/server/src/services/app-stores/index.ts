import { db } from "@tatame-monorepo/db";
import { appStores } from "@tatame-monorepo/db/schema";
import { isNull } from "drizzle-orm";

export class AppStoresService {
    constructor(accessToken: string) {
        // Access token kept for backward compatibility but not needed for Drizzle
    }

    /**
     * Get app stores
     */
    async list() {
        return await db.select().from(appStores)
            .where(isNull(appStores.disabledAt));
    }
}