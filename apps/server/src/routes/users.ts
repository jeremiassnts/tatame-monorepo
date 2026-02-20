import { approveStudentSchema, createUserSchema, denyStudentSchema, updateExpoPushTokenSchema, updateUserSchema } from "@/schemas/users";
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

// Approve student
usersRouter.post("/approve", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = approveStudentSchema.parse(req.body);
        const usersService = new UsersService();
        await usersService.approveStudent(validatedBody.userId);

        res.json({
            success: true,
            message: "Student approved successfully",
        });
    } catch (error) {
        next(error);
    }
});

// Deny student
usersRouter.post("/deny", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = denyStudentSchema.parse(req.body);
        const usersService = new UsersService();
        await usersService.denyStudent(validatedBody.userId);

        res.json({
            success: true,
            message: "Student denied successfully",
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
        if (validatedBody.first_name !== undefined) updateData.firstName = validatedBody.first_name;
        if (validatedBody.last_name !== undefined) updateData.lastName = validatedBody.last_name;
        if (validatedBody.email !== undefined) updateData.email = validatedBody.email;
        if (validatedBody.phone !== undefined) updateData.phone = validatedBody.phone;
        if (validatedBody.birth_day !== undefined) updateData.birthDay = validatedBody.birth_day;
        if (validatedBody.profile_picture !== undefined) updateData.profilePicture = validatedBody.profile_picture;
        if (validatedBody.gym_id !== undefined) updateData.gymId = validatedBody.gym_id;
        if (validatedBody.role !== undefined) updateData.role = validatedBody.role;
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

// Find users notification recipients
usersRouter.get("/:userId/notification-recipients", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { recipientIds } = req.query as { recipientIds: string[] };
        if (!recipientIds) {
            return res.status(400).json({ error: "Missing recipientIds" });
        }

        const usersService = new UsersService();
        const recipients = await usersService.findNotificationRecipients(recipientIds.map(Number));
        res.json({
            data: recipients,
        });
    } catch (error) {
        next(error);
    }
});

// Update expo push token
usersRouter.patch("/:userId/expo-push-token", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userId = Number.parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const validatedBody = updateExpoPushTokenSchema.parse(req.body);
        const usersService = new UsersService();
        await usersService.updateExpoPushToken(userId, validatedBody.expoPushToken);

        res.json({
            success: true,
            message: "Expo push token updated successfully",
        });
    } catch (error) {
        next(error);
    }
});