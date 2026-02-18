import { AppStoresService } from "@/services/app-stores";
import { Router } from "express";

export const appStoresRouter: Router = Router();

// List app stores (public - no auth required)
appStoresRouter.get("/", async (_, res, next) => {
    try {
        const appStoresService = new AppStoresService();
        const stores = await appStoresService.list();

        res.json({
            data: stores,
            count: stores.length,
        });
    } catch (error) {
        next(error);
    }
});
