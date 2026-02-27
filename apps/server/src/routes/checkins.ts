import { createCheckinSchema, listByClassIdAndUserIdSchema, listByClassIdParamsSchema, listByClassIdQuerySchema, listLastCheckinsSchema, listLastMonthCheckinsSchema } from "@/schemas/checkins";
import { CheckinsService } from "@/services/checkins";
import { Router } from "express";

export const checkinsRouter: Router = Router();

// Create a checkin
checkinsRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createCheckinSchema.parse(req.body);
        const checkinsService = new CheckinsService();
        await checkinsService.create({
            userId: validatedBody.userId,
            classId: validatedBody.classId,
            date: validatedBody.date,
        });

        res.status(201).json({
            success: true,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// Delete a checkin
checkinsRouter.delete("/:checkinId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const checkinId = Number.parseInt(req.params.checkinId, 10);
        if (Number.isNaN(checkinId)) {
            return res.status(400).json({ error: "Invalid checkinId" });
        }

        const checkinsService = new CheckinsService();
        await checkinsService.delete(checkinId);

        res.json({
            success: true,
            message: "Checkin deleted successfully",
        });
    } catch (error) {
        next(error);
    }
});

// List checkins by user id
checkinsRouter.get("/user/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const checkinsService = new CheckinsService();
        const checkins = await checkinsService.listByUserId(userId);

        res.json({
            data: checkins,
            count: checkins.length,
        });
    } catch (error) {
        next(error);
    }
});

// List last checkins by user id
checkinsRouter.get("/user/:userId/last", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedParams = listLastCheckinsSchema.parse({
            userId: req.params.userId,
        });

        const checkinsService = new CheckinsService();
        const checkins = await checkinsService.listLastCheckinsByUserId(validatedParams.userId);

        res.json({
            data: checkins,
            count: checkins.length,
        });
    } catch (error) {
        next(error);
    }
});

// List last month checkins by user id
checkinsRouter.get("/user/:userId/last-month", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedParams = listLastMonthCheckinsSchema.parse({
            userId: req.params.userId,
        });

        const checkinsService = new CheckinsService();
        const checkins = await checkinsService.listLastMonthCheckinsByUserId(validatedParams.userId);

        res.json({
            data: checkins,
            count: checkins.length,
        });
    } catch (error) {
        next(error);
    }
});

// List checkins by class id
checkinsRouter.get("/class/:classId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedParams = listByClassIdParamsSchema.parse({
            classId: req.params.classId,
        });
        const validatedQuery = listByClassIdQuerySchema.parse({
            date: req.query.date,
        });

        const checkinsService = new CheckinsService();
        const checkins = await checkinsService.listByClassId(validatedParams.classId, validatedQuery.date);

        res.json({
            data: checkins,
            count: checkins.length,
        });
    } catch (error) {
        next(error);
    }
});

// List checkins by class id and user id
checkinsRouter.get("/class/:classId/user/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedParams = listByClassIdAndUserIdSchema.parse({
            classId: req.params.classId,
            userId: req.params.userId,
        });

        const checkinsService = new CheckinsService();
        const checkins = await checkinsService.listByClassIdAndUserId(
            validatedParams.classId,
            validatedParams.userId,
        );

        res.json({
            data: checkins,
            count: checkins.length,
        });
    } catch (error) {
        next(error);
    }
});
