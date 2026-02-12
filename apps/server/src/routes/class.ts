import { createClassSchema, getToCheckInSchema, updateClassSchema } from "@/schemas/class";
import { ClassService } from "@/services/class";
import { Router } from "express";

export const classRouter: Router = Router();

// Get next class for a gym
classRouter.get("/next/:gymId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymId = Number.parseInt(req.params.gymId, 10);
        if (Number.isNaN(gymId)) {
            return res.status(400).json({ error: "Invalid gymId" });
        }

        const classService = new ClassService(accessToken);
        const nextClass = await classService.nextClass(gymId);

        res.json({
            data: nextClass,
        });
    } catch (error) {
        next(error);
    }
});

// Create a class
classRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createClassSchema.parse(req.body);
        const classService = new ClassService(accessToken);
        const classData = await classService.create(validatedBody);

        res.status(201).json({
            data: classData,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// List classes by gym id
classRouter.get("/gym/:gymId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymId = Number.parseInt(req.params.gymId, 10);
        if (Number.isNaN(gymId)) {
            return res.status(400).json({ error: "Invalid gymId" });
        }

        const classService = new ClassService(accessToken);
        const classes = await classService.list(gymId);

        res.json({
            data: classes,
            count: classes.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get a specific class
classRouter.get("/:classId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const classId = Number.parseInt(req.params.classId, 10);
        if (Number.isNaN(classId)) {
            return res.status(400).json({ error: "Invalid classId" });
        }

        const classService = new ClassService(accessToken);
        const classData = await classService.get(classId);

        res.json({
            data: classData,
        });
    } catch (error) {
        next(error);
    }
});

// Update a class
classRouter.put("/:classId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const classId = Number.parseInt(req.params.classId, 10);
        if (Number.isNaN(classId)) {
            return res.status(400).json({ error: "Invalid classId" });
        }

        const validatedBody = updateClassSchema.parse({ ...req.body, id: classId });
        const classService = new ClassService(accessToken);
        await classService.edit(validatedBody);

        res.json({
            success: true,
            message: "Class updated successfully",
        });
    } catch (error) {
        next(error);
    }
});

// Delete a class
classRouter.delete("/:classId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const classId = Number.parseInt(req.params.classId, 10);
        if (Number.isNaN(classId)) {
            return res.status(400).json({ error: "Invalid classId" });
        }

        const classService = new ClassService(accessToken);
        await classService.delete(classId);

        res.json({
            success: true,
            message: "Class deleted successfully",
        });
    } catch (error) {
        next(error);
    }
});

// Get class to check in
classRouter.get("/check-in/available", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedQuery = getToCheckInSchema.parse(req.query);
        const classService = new ClassService(accessToken);
        const classData = await classService.getToCheckIn(
            validatedQuery.gymId,
            validatedQuery.time,
            validatedQuery.day,
        );

        res.json({
            data: classData,
        });
    } catch (error) {
        next(error);
    }
});
