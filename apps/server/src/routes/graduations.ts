import { createGraduationSchema, updateGraduationSchema } from "@/schemas/graduations";
import { GraduationsService } from "@/services/graduations";
import { Router } from "express";

export const graduationsRouter: Router = Router();

// Get graduation by user id
graduationsRouter.get("/user/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const graduationsService = new GraduationsService();
        const graduation = await graduationsService.getGraduation(userId);

        res.json({
            data: graduation,
        });
    } catch (error) {
        next(error);
    }
});

// Create a graduation
graduationsRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createGraduationSchema.parse(req.body);
        const graduationsService = new GraduationsService();
        const graduation = await graduationsService.create({
            userId: validatedBody.userId,
            belt: validatedBody.belt,
            degree: validatedBody.degree,
            modality: validatedBody.modality,
        });

        res.status(201).json({
            data: graduation,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// Update a graduation
graduationsRouter.put("/:graduationId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const graduationId = Number.parseInt(req.params.graduationId, 10);
        if (Number.isNaN(graduationId)) {
            return res.status(400).json({ error: "Invalid graduationId" });
        }

        const validatedBody = updateGraduationSchema.parse({ ...req.body, id: graduationId });
        const graduationsService = new GraduationsService();
        await graduationsService.update(validatedBody);

        res.json({
            success: true,
            message: "Graduation updated successfully",
        });
    } catch (error) {
        next(error);
    }
});
