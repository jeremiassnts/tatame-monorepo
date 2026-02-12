export interface StripeCustomerMapping {
    id?: string;
    user_id: string;
    clerk_user_id: string;
    stripe_customer_id: string;
    created_at?: string;
    updated_at?: string;
}

export interface StripeWebhookEvent {
    id?: string;
    stripe_event_id: string;
    event_type: string;
    processed_at?: string;
    created_at?: string;
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5";
    };
    public: {
        Tables: {
            app_stores: {
                Row: {
                    created_at: string;
                    disabled_at: string | null;
                    id: number;
                    store: string | null;
                    url: string | null;
                };
                Insert: {
                    created_at?: string;
                    disabled_at?: string | null;
                    id?: number;
                    store?: string | null;
                    url?: string | null;
                };
                Update: {
                    created_at?: string;
                    disabled_at?: string | null;
                    id?: number;
                    store?: string | null;
                    url?: string | null;
                };
                Relationships: [];
            };
            assets: {
                Row: {
                    class_id: number | null;
                    content: string | null;
                    created_at: string;
                    id: number;
                    title: string | null;
                    type: string | null;
                    valid_until: string | null;
                };
                Insert: {
                    class_id?: number | null;
                    content?: string | null;
                    created_at?: string;
                    id?: number;
                    title?: string | null;
                    type?: string | null;
                    valid_until?: string | null;
                };
                Update: {
                    class_id?: number | null;
                    content?: string | null;
                    created_at?: string;
                    id?: number;
                    title?: string | null;
                    type?: string | null;
                    valid_until?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "assets_class_id_fkey";
                        columns: ["class_id"];
                        isOneToOne: false;
                        referencedRelation: "class";
                        referencedColumns: ["id"];
                    },
                ];
            };
            checkins: {
                Row: {
                    classId: number | null;
                    created_at: string;
                    date: string | null;
                    id: number;
                    userId: number | null;
                };
                Insert: {
                    classId?: number | null;
                    created_at?: string;
                    date?: string | null;
                    id?: number;
                    userId?: number | null;
                };
                Update: {
                    classId?: number | null;
                    created_at?: string;
                    date?: string | null;
                    id?: number;
                    userId?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "checkins_classId_fkey";
                        columns: ["classId"];
                        isOneToOne: false;
                        referencedRelation: "class";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "checkins_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            class: {
                Row: {
                    created_at: string;
                    created_by: number | null;
                    day: string | null;
                    deleted_at: string | null;
                    description: string | null;
                    end: string | null;
                    gym_id: number | null;
                    id: number;
                    instructor_id: number | null;
                    modality: string | null;
                    start: string | null;
                };
                Insert: {
                    created_at?: string;
                    created_by?: number | null;
                    day?: string | null;
                    deleted_at?: string | null;
                    description?: string | null;
                    end?: string | null;
                    gym_id?: number | null;
                    id?: number;
                    instructor_id?: number | null;
                    modality?: string | null;
                    start?: string | null;
                };
                Update: {
                    created_at?: string;
                    created_by?: number | null;
                    day?: string | null;
                    deleted_at?: string | null;
                    description?: string | null;
                    end?: string | null;
                    gym_id?: number | null;
                    id?: number;
                    instructor_id?: number | null;
                    modality?: string | null;
                    start?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "class_created_by_fkey";
                        columns: ["created_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "class_gym_id_fkey";
                        columns: ["gym_id"];
                        isOneToOne: false;
                        referencedRelation: "gyms";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "class_instructor_id_fkey";
                        columns: ["instructor_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            graduations: {
                Row: {
                    belt: string | null;
                    created_at: string;
                    degree: number | null;
                    id: number;
                    modality: string | null;
                    userId: number;
                };
                Insert: {
                    belt?: string | null;
                    created_at?: string;
                    degree?: number | null;
                    id?: number;
                    modality?: string | null;
                    userId: number;
                };
                Update: {
                    belt?: string | null;
                    created_at?: string;
                    degree?: number | null;
                    id?: number;
                    modality?: string | null;
                    userId?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "graduations_userId_fkey";
                        columns: ["userId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            gyms: {
                Row: {
                    address: string;
                    created_at: string;
                    id: number;
                    logo: string | null;
                    managerId: number;
                    name: string;
                    since: string;
                };
                Insert: {
                    address: string;
                    created_at?: string;
                    id?: number;
                    logo?: string | null;
                    managerId: number;
                    name: string;
                    since: string;
                };
                Update: {
                    address?: string;
                    created_at?: string;
                    id?: number;
                    logo?: string | null;
                    managerId?: number;
                    name?: string;
                    since?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "gyms_managerId_fkey";
                        columns: ["managerId"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            notifications: {
                Row: {
                    channel: string | null;
                    content: string | null;
                    created_at: string;
                    id: number;
                    recipients: string[] | null;
                    sent_at: string | null;
                    sent_by: number | null;
                    status: string | null;
                    title: string | null;
                    viewed_by: string[] | null;
                };
                Insert: {
                    channel?: string | null;
                    content?: string | null;
                    created_at?: string;
                    id?: number;
                    recipients?: string[] | null;
                    sent_at?: string | null;
                    sent_by?: number | null;
                    status?: string | null;
                    title?: string | null;
                    viewed_by?: string[] | null;
                };
                Update: {
                    channel?: string | null;
                    content?: string | null;
                    created_at?: string;
                    id?: number;
                    recipients?: string[] | null;
                    sent_at?: string | null;
                    sent_by?: number | null;
                    status?: string | null;
                    title?: string | null;
                    viewed_by?: string[] | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "notifications_sent_by_fkey";
                        columns: ["sent_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                ];
            };
            roles: {
                Row: {
                    created_at: string;
                    id: string;
                };
                Insert: {
                    created_at?: string;
                    id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                };
                Relationships: [];
            };
            users: {
                Row: {
                    approved_at: string | null;
                    birth: string | null;
                    birth_day: string | null;
                    clerk_user_id: string;
                    created_at: string;
                    customer_id: string | null;
                    deleted_at: string | null;
                    denied_at: string | null;
                    email: string | null;
                    expo_push_token: string | null;
                    first_name: string | null;
                    gender: string | null;
                    gym_id: number | null;
                    id: number;
                    instagram: string | null;
                    last_name: string | null;
                    migrated_at: string | null;
                    phone: string | null;
                    plan: string | null;
                    profile_picture: string | null;
                    role: string | null;
                    subscription_id: string | null;
                };
                Insert: {
                    approved_at?: string | null;
                    birth?: string | null;
                    birth_day?: string | null;
                    clerk_user_id: string;
                    created_at?: string;
                    customer_id?: string | null;
                    deleted_at?: string | null;
                    denied_at?: string | null;
                    email?: string | null;
                    expo_push_token?: string | null;
                    first_name?: string | null;
                    gender?: string | null;
                    gym_id?: number | null;
                    id?: number;
                    instagram?: string | null;
                    last_name?: string | null;
                    migrated_at?: string | null;
                    phone?: string | null;
                    plan?: string | null;
                    profile_picture?: string | null;
                    role?: string | null;
                    subscription_id?: string | null;
                };
                Update: {
                    approved_at?: string | null;
                    birth?: string | null;
                    birth_day?: string | null;
                    clerk_user_id?: string;
                    created_at?: string;
                    customer_id?: string | null;
                    deleted_at?: string | null;
                    denied_at?: string | null;
                    email?: string | null;
                    expo_push_token?: string | null;
                    first_name?: string | null;
                    gender?: string | null;
                    gym_id?: number | null;
                    id?: number;
                    instagram?: string | null;
                    last_name?: string | null;
                    migrated_at?: string | null;
                    phone?: string | null;
                    plan?: string | null;
                    profile_picture?: string | null;
                    role?: string | null;
                    subscription_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "users_gym_id_fkey";
                        columns: ["gym_id"];
                        isOneToOne: false;
                        referencedRelation: "gyms";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "users_role_fkey";
                        columns: ["role"];
                        isOneToOne: false;
                        referencedRelation: "roles";
                        referencedColumns: ["id"];
                    },
                ];
            };
            versions: {
                Row: {
                    appVersion: string | null;
                    created_at: string;
                    disabled_at: string | null;
                    id: number;
                };
                Insert: {
                    appVersion?: string | null;
                    created_at?: string;
                    disabled_at?: string | null;
                    id?: number;
                };
                Update: {
                    appVersion?: string | null;
                    created_at?: string;
                    disabled_at?: string | null;
                    id?: number;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    "public"
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R;
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
    ? R
    : never
    : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I;
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
    }
    ? I
    : never
    : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U;
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
    }
    ? U
    : never
    : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
    public: {
        Enums: {},
    },
} as const;
