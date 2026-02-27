import { createUserSchema, updateUserSchema } from "@/schemas/users";
import { UsersService } from "@/services/users";
import { isNeitherUndefinedNorNull } from "@/utils/object-validation";
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
        if (isNeitherUndefinedNorNull(validatedBody.clerkUserId)) updateData.clerkUserId = validatedBody.clerkUserId;
        if (isNeitherUndefinedNorNull(validatedBody.email)) updateData.email = validatedBody.email;
        if (isNeitherUndefinedNorNull(validatedBody.firstName)) updateData.firstName = validatedBody.firstName;
        if (isNeitherUndefinedNorNull(validatedBody.lastName)) updateData.lastName = validatedBody.lastName;
        if (isNeitherUndefinedNorNull(validatedBody.profilePicture)) updateData.profilePicture = validatedBody.profilePicture;
        if (isNeitherUndefinedNorNull(validatedBody.birth)) updateData.birth = validatedBody.birth;
        if (isNeitherUndefinedNorNull(validatedBody.birthDay)) updateData.birthDay = validatedBody.birthDay;
        if (isNeitherUndefinedNorNull(validatedBody.gender)) updateData.gender = validatedBody.gender;
        if (isNeitherUndefinedNorNull(validatedBody.phone)) updateData.phone = validatedBody.phone;
        if (isNeitherUndefinedNorNull(validatedBody.instagram)) updateData.instagram = validatedBody.instagram;
        if (isNeitherUndefinedNorNull(validatedBody.gymId)) updateData.gymId = validatedBody.gymId;
        if (isNeitherUndefinedNorNull(validatedBody.expoPushToken)) updateData.expoPushToken = validatedBody.expoPushToken;
        if (isNeitherUndefinedNorNull(validatedBody.customerId)) updateData.customerId = validatedBody.customerId;
        if (isNeitherUndefinedNorNull(validatedBody.subscriptionId)) updateData.subscriptionId = validatedBody.subscriptionId;
        if (isNeitherUndefinedNorNull(validatedBody.plan)) updateData.plan = validatedBody.plan;
        if (isNeitherUndefinedNorNull(validatedBody.approvedAt)) updateData.approvedAt = validatedBody.approvedAt;
        if (isNeitherUndefinedNorNull(validatedBody.deniedAt)) updateData.deniedAt = validatedBody.deniedAt;
        if (isNeitherUndefinedNorNull(validatedBody.migratedAt)) updateData.migratedAt = validatedBody.migratedAt;
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