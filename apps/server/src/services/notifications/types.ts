export interface SendNotificationProps {
    id: number;
    channel: string;
    title: string;
    content: string;
    recipients: string[];
}