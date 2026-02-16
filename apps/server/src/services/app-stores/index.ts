import { db } from "@tatame-monorepo/db";
import { appStores } from "@tatame-monorepo/db/schema";
import { isNull } from "drizzle-orm";

/** Service for app store links (iOS/Android). */
export class AppStoresService {
    constructor() { }

    /** Returns all app store entries that are not disabled. */
    async list() {
        return await db.select().from(appStores)
            .where(isNull(appStores.disabledAt));
    }
}