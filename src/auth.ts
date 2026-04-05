// src/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    GitHub,

    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string, 
          user.password
        );

        if (passwordsMatch) {
          return user;
        }
        
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign-in, attach user data to token
      if (user) {
        // For OAuth (GitHub), find or create the user in our DB
        if (account?.provider === "github") {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });
          if (!dbUser) {
            const baseUsername = (user.name || user.email!.split("@")[0])
              .toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
            // Ensure unique username
            let username = baseUsername;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}_${counter++}`;
            }
            dbUser = await prisma.user.create({
              data: {
                username,
                email: user.email!,
              }
            });
          }
          token.id = dbUser.id;
          token.username = dbUser.username;
        } else {
          // Credentials provider — user object is from our DB
          token.id = (user as { id: string }).id;
          token.username = (user as { username: string }).username;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { username?: string }).username = token.username as string;
      }
      return session;
    },
  },
})