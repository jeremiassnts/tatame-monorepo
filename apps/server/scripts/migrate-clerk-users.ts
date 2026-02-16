import { createClerkClient } from "@clerk/express";
import { db } from "@tatame-monorepo/db";
import { users } from "@tatame-monorepo/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@tatame-monorepo/env/server";

async function main() {
  console.log("Migrating Clerk users to Postgres...");
  const clerk = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  });
  console.log("Clerk client created");

  const { data: clerkUsers } = await clerk.users.getUserList();
  console.log(`Found ${clerkUsers.length} Clerk users`);

  for (const clerkUser of clerkUsers) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1);

    if (user) {
      await db
        .update(users)
        .set({
          email: clerkUser.emailAddresses[0]?.emailAddress ?? user.email,
          firstName: clerkUser.firstName ?? user.firstName,
          lastName: clerkUser.lastName ?? user.lastName,
          profilePicture: clerkUser.imageUrl ?? user.profilePicture,
          migratedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }
  }
  console.log("Migration completed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
