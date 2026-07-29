import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/lib/db";

/**
 * Authentication is entirely optional.
 *
 * Without a database the app still works — everything a guest does is kept in
 * local storage. Signing in adds cross-device sync for saved recipes and the
 * shopping list. So providers are registered conditionally based on which
 * environment variables are actually present, and the app never crashes at boot
 * because an OAuth secret is missing.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function buildProviders() {
  const providers: NextAuthConfig["providers"] = [];

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }),
    );
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  // Email + password only makes sense with somewhere to store the hash.
  if (isDatabaseConfigured()) {
    providers.push(
      Credentials({
        name: "Email",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(raw) {
          const parsed = credentialsSchema.safeParse(raw);
          if (!parsed.success) return null;

          const db = getDb();
          if (!db) return null;

          const user = await db.user.findUnique({
            where: { email: parsed.data.email },
          });

          // Compare against a dummy hash when the user does not exist so the
          // response time does not reveal whether an account is registered.
          const hash =
            user?.passwordHash ??
            "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvaliduO";

          const valid = await bcrypt.compare(parsed.data.password, hash);
          if (!valid || !user?.passwordHash) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
    );
  }

  return providers;
}

const db = getDb();

export const authConfig: NextAuthConfig = {
  // The adapter needs a database. Without one, sessions are JWT-only and no
  // user record is ever persisted.
  adapter: db ? PrismaAdapter(db) : undefined,
  providers: buildProviders(),
  session: {
    // JWT rather than database sessions so auth works identically in both
    // modes, and so session lookups do not add a query to every request.
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/** True when sign-in is actually usable in this deployment. */
export const isAuthConfigured = () =>
  buildProviders().length > 0 && Boolean(process.env.AUTH_SECRET);
