import { approveStudentSchema, createUserSchema, denyStudentSchema, updateUserSchema } from "@/schemas/users";
import { UsersService } from "@/services/users";
import { Router } from "express";

export const usersRouter: Router = Router();

// Create a user
usersRouter.post("/", async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const validatedBody = createUserSchema.parse(req.body);
        const usersService = new UsersService(accessToken);
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

        const usersService = new UsersService(accessToken);
        const user = await usersService.get(userId);

        res.json({
            data: user,
        });
    } catch (error) {
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
        const usersService = new UsersService(accessToken);
        const user = await usersService.getByClerkUserId(clerkUserId);

        res.json({
            data: user,
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

        const usersService = new UsersService(accessToken);
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

        const usersService = new UsersService(accessToken);
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

        const usersService = new UsersService(accessToken);
        const users = await usersService.getBirthdayUsers(new Date().toISOString());

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
        const usersService = new UsersService(accessToken);
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
        const usersService = new UsersService(accessToken);
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

        const usersService = new UsersService(accessToken);
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
        const usersService = new UsersService(accessToken);
        await usersService.update(validatedBody);

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
        const usersService = new UsersService(accessToken);
        await usersService.delete(userId);

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
});
