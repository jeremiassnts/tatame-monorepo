import { VersionsService } from "@/services/versions";
import { Router } from "express";

export const versionsRouter: Router = Router();

// Get current version
versionsRouter.get("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const versionsService = new VersionsService();
        const version = await versionsService.get();

        res.json({
            data: version,
        });
    } catch (error) {
        next(error);
    }
});
