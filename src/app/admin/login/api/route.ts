import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET ; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check in Admin table first
    let user = await prisma.admin.findUnique({ where: { email } });
    let role = "admin";

    if (!user) {
      // If not admin, check in User table
      user = await prisma.user.findUnique({ where: { email } });
      role = "user";

      // Check if user is active
      if (user && user.status !== "Active") {
        return NextResponse.json({ error: "Your status is Inactive. Please contact admin." }, { status: 403 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      role,
      redirectTo: role === "admin" ? "/admin/dashboard" : "/user/dashboard",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
