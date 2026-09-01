import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { env } from "./env";
import { errors } from "./api";
import type { Role } from "@repo/types";

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const okPw = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!okPw) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, universityId: user.universityId };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.universityId = user.universityId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.universityId = token.universityId ?? null;
      }
      return session;
    },
  },
};

/** Server-side session helper. */
export function getSession() {
  return getServerSession(authOptions);
}

/**
 * Guard for route handlers. Use inside route():
 *   const session = await requireRole(["CITIZEN", "ADMIN"]);
 * Throws HttpError (401/403) that route() maps to the envelope.
 */
export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session?.user) throw errors.unauthorized();
  if (!roles.includes(session.user.role)) throw errors.forbidden();
  return session;
}

/** Where each role lands after login. */
export const HOME_FOR_ROLE: Record<Role, string> = {
  CITIZEN: "/citizen",
  STUDENT: "/university",
  FACULTY: "/university",
  UNIVERSITY_ADMIN: "/university",
  INDUSTRY: "/industry",
  GOVERNMENT: "/gov",
  ADMIN: "/admin",
};
