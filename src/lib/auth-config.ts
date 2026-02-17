import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { verifyPassword } from "@/lib/auth";
import { logAuthAttempt } from "@/lib/audit-log";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Disabled for JWT sessions
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("LOGIN FAIL: Missing credentials");
          // Format request object slightly differently for server-side calls if needed
          // or just pass null for req since we might not have easy access to NextRequest here
          await logAuthAttempt({ 
            email: "unknown", 
            success: false 
          });
          throw new Error("Invalid credentials");
        }

        const email = credentials.email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            role: true,
            status: true,
            requiresPasswordChange: true,
            image: true,
          },
        });

        if (!user) {
          console.log(`LOGIN FAIL: User not found for email ${email}`);
          throw new Error("Invalid credentials");
        }

        if (!user.password) {
          console.log(`LOGIN FAIL: User ${email} has no password (users with social login cannot use credentials)`);
          throw new Error("Invalid credentials");
        }

        if (user.status !== UserStatus.ACTIVE) {
          console.log(`LOGIN FAIL: User ${email} is not active (Status: ${user.status})`);
          throw new Error("Account is not active");
        }

        const isValidPassword = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          console.log(`LOGIN FAIL: Invalid password for ${email}`);
          throw new Error("Invalid credentials");
        }

        console.log(`LOGIN SUCCESS: User ${email} authenticated`);

        await logAuthAttempt({
          email,
          userId: user.id,
          success: true,
        });

        // Return user object (password excluded)
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          requiresPasswordChange: user.requiresPasswordChange,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Split name for social login
            const fullSocialName = user.name || "User";
            const nameParts = fullSocialName.split(" ");
            const firstName = nameParts[0] || "User";
            const lastName = nameParts.slice(1).join(" ") || "Guest";

            // Create new user with default role
            await prisma.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                role: UserRole.STUDENT,
                status: UserStatus.ACTIVE,
                image: user.image,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error during social sign-in:", error);
          await logAuthAttempt({
            email: user.email || "unknown",
            success: false,
          });
          return false;
        }
      }
      
      // Log successful social login
      if (user.email) {
         await logAuthAttempt({
            email: user.email,
            userId: user.id,
            success: true,
         });
      }
      
      return true;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.requiresPasswordChange = user.requiresPasswordChange;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.status = token.status as any;
        session.user.requiresPasswordChange = token.requiresPasswordChange as boolean;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/onboarding",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
