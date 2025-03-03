import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        let user = await prisma.admin.findUnique({ where: { email: credentials.email } });
        let role = "admin";

        if (!user) {
          user = await prisma.user.findUnique({ where: { email: credentials.email } });
          role = "user";

          if (user && user.status !== "Active") {
            throw new Error("Your account is inactive. Please contact admin.");
          }
        }

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name || user.fullName || "No Name",
          email: user.email,
          role,
          status: user.status, 
          accessToken: user.token,

        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status; 
        token.name = user.name; 
        token.accessToken = user.accessToken;
        
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.name = token.name; 
        session.user.accessToken = token.accessToken; 
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
