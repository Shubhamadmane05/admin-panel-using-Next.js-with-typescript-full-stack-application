// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import crypto from "crypto";
// import { sendMail } from "@/app/lib/mail"; // Ensure this function exists and works properly

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     if (!body || !body.email) {
//       return NextResponse.json({ message: "Email is required" }, { status: 400 });
//     }

//     const { email } = body;

//     // Check if user exists
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     // Generate a secure token
//     const token = crypto.randomBytes(32).toString("hex");
//     const expires = new Date(Date.now() + 30 * 60 * 1000); // Token expires in 30 minutes

//     // Store token in database
//     await prisma.passwordResetToken.upsert({
//       where: { userId: user.id },
//       update: { token, expires },
//       create: { token, userId: user.id, expires },
//     });

//     // Construct reset link
//     const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
//     console.log("Generated Reset Link:", resetLink); // Debugging log

//     // Send the email
//     try {
//       await sendMail(user.email, "Password Reset", `Click this link to reset your password: ${resetLink}`);
//       console.log("Email successfully sent to:", user.email);
//     } catch (emailError) {
//       console.error("Failed to send email:", emailError);
//       return NextResponse.json({ message: "Failed to send reset email" }, { status: 500 });
//     }

//     return NextResponse.json({ message: "Password reset link sent to your email!" });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendMail } from "@/app/lib/mail";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const { email } = body;

    // Check if the email exists in User model first
    let user = await prisma.user.findUnique({ where: { email } });
    let role = "user";

    // If not found, check in Admin model
    if (!user) {
      user = await prisma.admin.findUnique({ where: { email } });
      role = "admin";
    }

    // If user/admin is not found, return error
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // Token expires in 30 minutes

    // Store token in database
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token, expires },
      create: { token, userId: user.id, expires },
    });

    // Ensure that process.env.NEXT_PUBLIC_BASE_URL is correctly set
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error("NEXT_PUBLIC_BASE_URL is not defined in environment variables.");
      return NextResponse.json({ message: "Server error: Missing base URL" }, { status: 500 });
    }

    // Construct reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    console.log("Generated Reset Link:", resetLink); // Debugging log

    // Ensure user.email exists before sending
    if (!user.email) {
      console.error("User email is missing:", user);
      return NextResponse.json({ message: "Invalid user data" }, { status: 500 });
    }

    // Send the email
    try {
      await sendMail(user.email, "Password Reset", `Click this link to reset your password: ${resetLink}`);
      console.log(`Email successfully sent to ${role}:`, user.email);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json({ message: "Failed to send reset email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
