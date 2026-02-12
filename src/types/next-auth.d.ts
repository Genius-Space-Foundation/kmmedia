import { UserRole, UserStatus } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      status: UserStatus;
      requiresPasswordChange: boolean;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: UserStatus;
    requiresPasswordChange: boolean;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    requiresPasswordChange: boolean;
  }
}
