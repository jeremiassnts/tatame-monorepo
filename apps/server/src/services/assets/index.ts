import { db } from "@tatame-monorepo/db";
import { assets } from "@tatame-monorepo/db/schema";
import { desc, eq } from "drizzle-orm";

/** Service for class assets (e.g. videos, documents). */
export class AssetsService {
    constructor() { }

    /** Creates an asset linked to a class. */
    async create(asset: { class_id?: number | null; title?: string | null; content?: string | null; type?: string | null; valid_until?: string | null }) {
        const [created] = await db
            .insert(assets)
            .values({
                classId: asset.class_id,
                title: asset.title,
                content: asset.content,
                type: asset.type,
                validUntil: asset.valid_until ? new Date(asset.valid_until) : null,
            })
            .returning();

        return created;
    }

    /** Deletes an asset by id and returns the deleted row(s). */
    async delete(assetId: number) {
        const deleted = await db
            .delete(assets)
            .where(eq(assets.id, assetId))
            .returning();
        return deleted;
    }

    /** Lists all assets of type "video", newest first. */
    async listVideos() {
        return await db
            .select()
            .from(assets)
            .where(eq(assets.type, "video"))
            .orderBy(desc(assets.createdAt));
    }
}
