import type { Role } from "@repo/types";
import "next-auth";
import "next-auth/jwt";

// Carry `role` and `universityId` through the session + JWT.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      universityId?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }
  interface User {
    id: string;
    role: Role;
    universityId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    universityId?: string | null;
  }
}
