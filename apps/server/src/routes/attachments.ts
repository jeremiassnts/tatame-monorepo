import { AttachmentsService } from "@/services/attachments";
import { Router } from "express";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
});

export const attachmentsRouter: Router = Router();

// POST /attachments/image - upload a single image (multipart/form-data, field name: file)
attachmentsRouter.post("/image", upload.single("file"), async (req, res, next) => {
    try {
        const accessToken = await req.auth?.getToken();
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "Missing file field 'file'" });
        }

        const attachmentsService = new AttachmentsService();
        if (!attachmentsService.isAllowedImageType(file.mimetype)) {
            return res.status(400).json({
                error: "Invalid file type. Allowed: png, jpg, jpeg",
            });
        }

        const buffer = new Uint8Array(file.buffer);
        const result = await attachmentsService.uploadImage(
            buffer,
            file.mimetype,
            file.originalname || "upload",
        );

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error && error.message.includes("Missing required environment")) {
            return res.status(500).json({ error: "Missing required environment variables" });
        }
        if (error instanceof Error && error.message.includes("Invalid file type")) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});
