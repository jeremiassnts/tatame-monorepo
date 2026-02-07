import { env } from "@tatame-monorepo/env/server";
import { Resend } from "resend";

export class ResendService {
    private resend: Resend;
    constructor() {
        this.resend = new Resend(env.RESEND_API_KEY);
    }
    /**
     * Send an email
     */
    async sendEmailWithTemplate(templateId: string, to: string, variables: Record<string, string>) {
        const template = await this.resend.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        await this.resend.emails.send({
            template: {
                id: templateId,
                variables
            },
            to
        })
    }
}