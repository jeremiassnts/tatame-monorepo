import { createUserSchema, updateUserSchema } from "@/schemas/users";
import { UsersService } from "@/services/users";
import { Router } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const usersRouter: Router = Router();

// Create a user
usersRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createUserSchema.parse(req.body);
        const usersService = new UsersService();
        const user = await usersService.create(
            validatedBody.clerkUserId,
            validatedBody.role,
            validatedBody.email,
            validatedBody.firstName,
            validatedBody.lastName,
            validatedBody.profilePicture ?? "",
        );

        res.status(201).json({
            data: user,
            created: true,
        });
    } catch (error) {
        next(error);
    }
});

// Find users notification recipients (expo push tokens by user ids)
usersRouter.get("/notification-recipients", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const raw = req.query.recipientIds;
        const recipientIds: number[] = Array.isArray(raw)
            ? raw.map((id) => Number.parseInt(String(id), 10))
            : typeof raw === "string"
              ? raw.split(",").map((id) => Number.parseInt(id.trim(), 10))
              : [];
        const validIds = recipientIds.filter((id) => !Number.isNaN(id));
        if (validIds.length === 0) {
            return res.status(400).json({ error: "Missing or invalid recipientIds (comma-separated or repeated query param)" });
        }

        const usersService = new UsersService();
        const recipients = await usersService.findNotificationRecipients(validIds);
        res.json({
            data: recipients,
            count: recipients.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get user by id
usersRouter.get("/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const usersService = new UsersService();
        const user = await usersService.get(userId);

        res.json({
            data: user,
        });
    } catch (error) {
        next(error);
    }
});

// Update profile image (Clerk user id)
usersRouter.post("/clerk/:clerkUserId/profile-image", upload.single("file"), async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const clerkUserId = req.params.clerkUserId as string;
        if (!clerkUserId) {
            return res.status(400).json({ error: "Missing user id" });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Missing file field" });
        }

        const usersService = new UsersService();
        const result = await usersService.updateClerkProfileImage(
            clerkUserId,
            file.buffer,
            file.mimetype,
            file.originalname || "upload",
        );

        res.json(result);
    } catch (error) {
        const err = error as Error & { status?: number; statusCode?: number };
        if (err?.status === 404 || err?.statusCode === 404 || err?.message?.toLowerCase().includes("not found")) {
            return res.status(404).json({ error: "User not found" });
        }
        next(error);
    }
});

// Get user by Clerk user id
usersRouter.get("/clerk/:clerkUserId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const clerkUserId = req.params.clerkUserId;
        const usersService = new UsersService();
        const user = await usersService.getByClerkUserId(clerkUserId);

        res.json({
            data: user ?? null,
        });
    } catch (error) {
        next(error);
    }
});

// List students by gym id
usersRouter.get("/gym/:gymId/students", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymId = Number.parseInt(req.params.gymId, 10);
        if (Number.isNaN(gymId)) {
            return res.status(400).json({ error: "Invalid gymId" });
        }

        const usersService = new UsersService();
        const students = await usersService.listStudentsByGymId(gymId);

        res.json({
            data: students,
            count: students.length,
        });
    } catch (error) {
        next(error);
    }
});

// List instructors by gym id
usersRouter.get("/gym/:gymId/instructors", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const gymId = Number.parseInt(req.params.gymId, 10);
        if (Number.isNaN(gymId)) {
            return res.status(400).json({ error: "Invalid gymId" });
        }

        const usersService = new UsersService();
        const instructors = await usersService.listInstructorsByGymId(gymId);

        res.json({
            data: instructors,
            count: instructors.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get birthday users
usersRouter.get("/birthdays/today", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const usersService = new UsersService();
        const users = await usersService.getBirthdayUsers();
        res.json({
            data: users,
            count: users.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get student approval status
usersRouter.get("/:userId/approval-status", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const usersService = new UsersService();
        const isApproved = await usersService.getStudentsApprovalStatus(userId);

        res.json({
            data: { isApproved },
        });
    } catch (error) {
        next(error);
    }
});

// Update user
usersRouter.put("/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const validatedBody = updateUserSchema.parse({ ...req.body, id: userId });
        const usersService = new UsersService();
        const updateData: Record<string, unknown> = { id: validatedBody.id };
        if (validatedBody.clerkUserId !== undefined) updateData.clerkUserId = validatedBody.clerkUserId;
        if (validatedBody.email !== undefined) updateData.email = validatedBody.email;
        if (validatedBody.firstName !== undefined) updateData.firstName = validatedBody.firstName;
        if (validatedBody.lastName !== undefined) updateData.lastName = validatedBody.lastName;
        if (validatedBody.profilePicture !== undefined) updateData.profilePicture = validatedBody.profilePicture;
        if (validatedBody.birth !== undefined) updateData.birth = validatedBody.birth;
        if (validatedBody.birthDay !== undefined) updateData.birthDay = validatedBody.birthDay;
        if (validatedBody.gender !== undefined) updateData.gender = validatedBody.gender;
        if (validatedBody.phone !== undefined) updateData.phone = validatedBody.phone;
        if (validatedBody.instagram !== undefined) updateData.instagram = validatedBody.instagram;
        if (validatedBody.gymId !== undefined) updateData.gymId = validatedBody.gymId;
        if (validatedBody.expoPushToken !== undefined) updateData.expoPushToken = validatedBody.expoPushToken;
        if (validatedBody.customerId !== undefined) updateData.customerId = validatedBody.customerId;
        if (validatedBody.subscriptionId !== undefined) updateData.subscriptionId = validatedBody.subscriptionId;
        if (validatedBody.plan !== undefined) updateData.plan = validatedBody.plan;
        if (validatedBody.approvedAt !== undefined) updateData.approvedAt = validatedBody.approvedAt;
        if (validatedBody.deniedAt !== undefined) updateData.deniedAt = validatedBody.deniedAt;
        if (validatedBody.migratedAt !== undefined) updateData.migratedAt = validatedBody.migratedAt;
        await usersService.update(updateData as { id: number } & Record<string, unknown>);

        res.json({
            success: true,
            message: "User updated successfully",
        });
    } catch (error) {
        next(error);
    }
});

// Delete user
usersRouter.delete("/:userId", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = req.params.userId;
        const usersService = new UsersService();
        await usersService.delete(userId);

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
});