import { associateGymSchema, createGymSchema } from "@/schemas/gyms";
import { GymsService } from "@/services/gyms";
import { Router } from "express";

export const gymsRouter: Router = Router();

// Create a gym
gymsRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createGymSchema.parse(req.body);
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const gymsService = new GymsService(accessToken);
        const gym = await gymsService.create({
            name: validatedBody.name,
            address: validatedBody.address ?? "",
            managerId: userId,
            since: validatedBody.since ?? "",
            logo: validatedBody.logo ?? "",
        }, userId);

        res.status(201).json({
            data: gym,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// List all gyms
gymsRouter.get("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymsService = new GymsService(accessToken);
        const gyms = await gymsService.list();

        res.json({
            data: gyms,
            count: gyms.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get gym by user id
gymsRouter.get("/user/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const gymsService = new GymsService(accessToken);
        const gym = await gymsService.getByUserId(userId);

        res.json({
            data: gym,
        });
    } catch (error) {
        next(error);
    }
});

// Associate a gym to a user
gymsRouter.post("/associate", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = associateGymSchema.parse(req.body);
        const gymsService = new GymsService(accessToken);
        await gymsService.associate(validatedBody.gymId, validatedBody.userId);

        res.json({
            success: true,
            message: "Gym associated successfully",
        });
    } catch (error) {
        next(error);
    }
});
