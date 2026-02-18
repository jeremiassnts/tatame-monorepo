import { VersionsService } from "@/services/versions";
import { Router } from "express";

export const versionsRouter: Router = Router();

// Get current version (public)
versionsRouter.get("/", async (_, res, next) => {
    try {
        const versionsService = new VersionsService();
        const version = await versionsService.get();

        res.json({
            data: version,
        });
    } catch (error) {
        next(error);
    }
});
