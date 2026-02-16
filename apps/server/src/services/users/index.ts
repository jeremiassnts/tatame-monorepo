import { BELT_ORDER } from "@/constants/belt";
import { db } from "@tatame-monorepo/db";
import { users, graduations } from "@tatame-monorepo/db/schema";
import { eq, and, or, isNull, isNotNull } from "drizzle-orm";
import { format } from "date-fns";
import { NotificationsService } from "../notifications";
import { RolesService } from "../roles";

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type UserUpdate = Partial<Omit<User, "id">> & { id: number };

export class UsersService {
    private rolesService: RolesService;
    private notificationsService: NotificationsService;
    
    constructor(accessToken: string) {
        this.rolesService = new RolesService(accessToken);
        this.notificationsService = new NotificationsService(accessToken);
    }

    async create(clerkUserId: string, role: string, email: string, firstName: string, lastName: string, profilePicture: string) {
        const [user] = await db.insert(users).values({
            clerkUserId,
            role,
            email,
            firstName,
            lastName,
            profilePicture,
            approvedAt: this.rolesService.isHigherRole(role) ? new Date() : null,
            migratedAt: new Date(),
        }).returning();

        return user;
    }

    async get(userId: number): Promise<User | undefined> {
        return await db.query.users.findFirst({
            where: eq(users.id, userId),
        });
    }

    async getByClerkUserId(clerkUserId: string): Promise<User | undefined> {
        return await db.query.users.findFirst({
            where: eq(users.clerkUserId, clerkUserId),
        });
    }

    async listStudentsByGymId(gymId: number) {
        // Fetch users with their graduations
        const studentsWithGraduations = await db
            .select({
                user: users,
                graduation: graduations,
            })
            .from(users)
            .leftJoin(graduations, eq(graduations.userId, users.id))
            .where(eq(users.gymId, gymId));

        // Transform to match expected format and sort
        const result = studentsWithGraduations.map(({ user, graduation }) => ({
            ...user,
            graduations: graduation ? {
                belt: graduation.belt,
                degree: graduation.degree,
            } : null,
            // Add belt and degree at root level for sorting (if graduation exists)
            belt: graduation?.belt,
            degree: graduation?.degree,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        }));

        // Sort by belt, degree, and name
        return result.sort((a, b) => {
            if (a.belt === b.belt) {
                if (a.degree === b.degree) {
                    return a.name.localeCompare(b.name);
                }
                return (b.degree ?? 0) - (a.degree ?? 0);
            }
            //@ts-ignore
            return (BELT_ORDER[a.belt] ?? 0) - (BELT_ORDER[b.belt] ?? 0);
        });
    }

    async approveStudent(userId: number) {
        await db.update(users)
            .set({ 
                approvedAt: new Date(), 
                deniedAt: null 
            })
            .where(eq(users.id, userId));

        await this.notificationsService.create({
            title: "Parabéns! Seu cadastro foi aprovado",
            content: `Aproveite, agora você pode acessar todos os recursos da plataforma!`,
            recipients: [userId.toString()],
            channel: "push",
            status: "pending",
            viewed_by: [],
        });
    }

    async denyStudent(userId: number) {
        await db.update(users)
            .set({ 
                deniedAt: new Date(), 
                approvedAt: null 
            })
            .where(eq(users.id, userId));

        await this.notificationsService.create({
            title: "Que pena! Seu cadastro foi negado",
            content: `Por favor, contate o suporte para mais informações`,
            recipients: [userId.toString()],
            channel: "push",
            status: "pending",
            viewed_by: [],
        });
    }

    async getStudentsApprovalStatus(userId: number): Promise<boolean> {
        const role = await this.rolesService.getRoleByUserId(userId);
        if (this.rolesService.isHigherRole(role)) {
            return true;
        }
        
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                approvedAt: true,
                deniedAt: true,
            },
        });

        if (!user) {
            return false;
        }

        return !!user.approvedAt && !user.deniedAt;
    }

    async update(data: UserUpdate): Promise<void> {
        const { id, ...updateData } = data;
        await db.update(users)
            .set(updateData)
            .where(eq(users.id, id));
    }

    async delete(userId: string): Promise<void> {
        await db.update(users)
            .set({ deletedAt: new Date() })
            .where(eq(users.id, Number.parseInt(userId)));
    }

    async getBirthdayUsers(date: string) {
        const formatted = format(new Date(), "MM-dd");
        const birthdayUsers = await db
            .select()
            .from(users)
            .where(eq(users.birthDay, formatted));

        return birthdayUsers.sort((a, b) => {
            return (a.firstName ?? "").localeCompare(b.firstName ?? "");
        });
    }

    async listInstructorsByGymId(gymId: number): Promise<User[]> {
        // MANAGER or INSTRUCTOR with approved_at not null
        const instructors = await db
            .select()
            .from(users)
            .where(
                and(
                    eq(users.gymId, gymId),
                    or(
                        eq(users.role, "MANAGER"),
                        and(
                            eq(users.role, "INSTRUCTOR"),
                            isNotNull(users.approvedAt)
                        )
                    )
                )
            );

        return instructors;
    }
}