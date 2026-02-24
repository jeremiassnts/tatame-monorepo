import { associateGymSchema, createGymSchema, updateGymSchema } from "@/schemas/gyms";
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

        const gymsService = new GymsService();
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

        const gymsService = new GymsService();
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

        const gymsService = new GymsService();
        const gym = await gymsService.getByUserId(userId);

        res.json({
            data: gym ?? null,
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
        const gymsService = new GymsService();
        await gymsService.associate(validatedBody.gymId, validatedBody.userId);

        res.json({
            success: true,
            message: "Gym associated successfully",
        });
    } catch (error) {
        next(error);
    }
});


// Get gym by id
gymsRouter.get("/:gymId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymId = Number.parseInt(req.params.gymId, 10);
        if (Number.isNaN(gymId)) {
            return res.status(400).json({ error: "Invalid gymId" });
        }

        const gymsService = new GymsService();
        const gym = await gymsService.getById(gymId);
        if (!gym) {
            return res.status(404).json({ error: "Gym not found" });
        }

        res.json({ data: gym });
    } catch (error) {
        next(error);
    }
});

// Update gym
gymsRouter.put("/:gymId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymId = Number.parseInt(req.params.gymId, 10);
        if (Number.isNaN(gymId)) {
            return res.status(400).json({ error: "Invalid gymId" });
        }

        const validatedBody = updateGymSchema.parse({ ...req.body, id: gymId });
        const gymsService = new GymsService();
        const updateData: Record<string, unknown> = { id: validatedBody.id };
        if (validatedBody.name !== undefined) updateData.name = validatedBody.name;
        if (validatedBody.address !== undefined) updateData.address = validatedBody.address;
        if (validatedBody.phone !== undefined) updateData.phone = validatedBody.phone;
        if (validatedBody.email !== undefined) updateData.email = validatedBody.email;
        if (validatedBody.description !== undefined) updateData.description = validatedBody.description;
        if (validatedBody.since !== undefined) updateData.since = validatedBody.since;
        if (validatedBody.logo !== undefined) updateData.logo = validatedBody.logo;
        await gymsService.update(updateData as { id: number } & Record<string, unknown>);

        res.json({
            success: true,
            message: "Gym updated successfully",
        });
    } catch (error) {
        next(error);
    }
});