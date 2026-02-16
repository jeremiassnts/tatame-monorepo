import { env } from "@tatame-monorepo/env/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"] as const;

/** Service for file attachment management (e.g. image uploads to R2). */
export class AttachmentsService {
    constructor() {}

    /**
     * Validates that the given MIME type is allowed for image uploads.
     */
    isAllowedImageType(mimetype: string): boolean {
        return ALLOWED_IMAGE_TYPES.includes(mimetype as (typeof ALLOWED_IMAGE_TYPES)[number]);
    }

    /**
     * Uploads an image to R2 (S3-compatible) and returns the unique storage key.
     * @param buffer - File buffer
     * @param mimetype - MIME type (must be image/png, image/jpg, or image/jpeg)
     * @param originalName - Original filename
     * @returns The unique key (filename) used in storage; clients can build the public URL from this.
     */
    async uploadImage(
        buffer: Uint8Array,
        mimetype: string,
        originalName: string,
    ): Promise<{ url: string }> {
        const accountId = env.CLOUDFLARE_ACCOUNT_ID;
        const accessKeyId = env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
        const bucketName = env.AWS_BUCKET_NAME;

        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error("Missing required environment variables for attachments (R2)");
        }

        if (!this.isAllowedImageType(mimetype)) {
            throw new Error("Invalid file type. Allowed: png, jpg, jpeg");
        }

        const client = new S3Client({
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            region: "auto",
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        const uploadId = randomUUID();
        const uniqueFileName = `${uploadId}-${originalName || "upload"}`;

        await client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: uniqueFileName,
                Body: buffer,
                ContentType: mimetype,
            }),
        );

        return { url: uniqueFileName };
    }
}
