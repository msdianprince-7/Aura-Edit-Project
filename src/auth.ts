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
})