import { createAssetSchema } from "@/schemas/assets";
import { AssetsService } from "@/services/assets";
import { Router } from "express";

export const assetsRouter: Router = Router();

// List all assets of type "video", newest first
assetsRouter.get("/videos", async (_, res, next) => {
    try {
        const assetsService = new AssetsService();
        const videos = await assetsService.listVideos();

        res.json({
            data: videos,
            count: videos.length,
        });
    } catch (error) {
        next(error);
    }
});

// Create an asset (linked to a class)
assetsRouter.post("/", async (req, res, next) => {
    try {
        const validatedBody = createAssetSchema.parse(req.body);
        const assetsService = new AssetsService();
        const asset = await assetsService.create({
            class_id: validatedBody.class_id ?? null,
            title: validatedBody.title ?? null,
            content: validatedBody.content ?? null,
            type: validatedBody.type ?? null,
            valid_until: validatedBody.valid_until ?? null,
        });

        res.status(201).json({
            data: asset,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// Delete an asset by id
assetsRouter.delete("/:assetId", async (req, res, next) => {
    try {
        const assetId = Number.parseInt(req.params.assetId, 10);
        if (Number.isNaN(assetId)) {
            return res.status(400).json({ error: "Invalid assetId" });
        }

        const assetsService = new AssetsService();
        const deleted = await assetsService.delete(assetId);

        if (!deleted.length) {
            return res.status(404).json({ error: "Asset not found" });
        }

        res.json({
            success: true,
            message: "Asset deleted successfully",
            data: deleted[0],
        });
    } catch (error) {
        next(error);
    }
});
