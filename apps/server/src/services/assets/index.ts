import { db } from "@tatame-monorepo/db";
import { assets } from "@tatame-monorepo/db/schema";
import { eq, desc } from "drizzle-orm";

export class AssetsService {
    constructor(accessToken: string) {
        // Access token kept for backward compatibility but not needed for Drizzle
    }

    /**
     * Create an asset
     */
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

    /**
     * Delete an asset
     */
    async delete(assetId: number) {
        const deleted = await db
            .delete(assets)
            .where(eq(assets.id, assetId))
            .returning();
        return deleted;
    }

    /**
     * List videos
     */
    async listVideos() {
        return await db
            .select()
            .from(assets)
            .where(eq(assets.type, "video"))
            .orderBy(desc(assets.createdAt));
    }
}
