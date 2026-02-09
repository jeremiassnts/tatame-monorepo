import { createClerkClient } from "@clerk/express";
import { createClient } from "@supabase/supabase-js";
import { env } from "@tatame-monorepo/env/server";

async function main() {
  console.log("Migrating Clerk users to Supabase...");
  const clerk = createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  })
  console.log("Clerk client created");
  const session = await clerk.sessions.createSession({
    userId: ""
  })
  const token = await clerk.sessions.getToken(session.id)
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    accessToken: async () => token.jwt
  });
  console.log("Supabase client created");
  const { data: clerkUsers } = await clerk.users.getUserList();
  console.log(`Found ${clerkUsers.length} Clerk users`);
  for (const clerkUser of clerkUsers) {
    const { data: user } = await supabase.from("users").select("*").eq("clerk_user_id", clerkUser.id).maybeSingle()
    if (user) {
      await supabase.from("users").update({
        email: clerkUser.emailAddresses[0]?.emailAddress,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        profile_picture: clerkUser.imageUrl,
        migrated_at: new Date().toISOString(),
      }).eq("id", user.id);
    }
  }
  console.log("Migration completed");
}
// Executar o script
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
