// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing email or password");
//         }

//         // Check both User and Admin tables
//         let user = await prisma.user.findUnique({ where: { email: credentials.email } });
//         let admin = await prisma.admin.findUnique({ where: { email: credentials.email } });

//         let account = admin || user;
//         let role = admin ? "admin" : user ? "user" : null;

//         if (!account) {
//           throw new Error("User not found");
//         }

//         // Validate password
//         const passwordMatch = await bcrypt.compare(credentials.password, account.password);
//         if (!passwordMatch) {
//           throw new Error("Invalid password");
//         }

//         // If user, check status
//         if (role === "user" && account.status !== "Active") {
//           throw new Error("Your status is Inactive. Please contact admin.");
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//           { id: account.id, email: account.email, role },
//           JWT_SECRET,
//           { expiresIn: "1h" }
//         );

//         return {
//           id: account.id,
//           name: account.fullName,
//           email: account.email,
//           role,
//           token,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//         token.accessToken = user.token;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session?.user) {
//         session.user.role = token.role;
//         session.accessToken = token.accessToken;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   debug: true, // Enable debug mode to see logs
//   session: {
//     strategy: "jwt", // Use JWT-based sessions
//   },
//   jwt: {
//     secret: JWT_SECRET, // Ensure consistency
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
