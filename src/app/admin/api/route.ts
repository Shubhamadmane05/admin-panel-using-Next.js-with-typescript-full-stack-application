import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = parseInt(params.id);

  if (isNaN(adminId)) {
    return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...admin,
      photo: admin.photo ? Buffer.from(admin.photo).toString("base64") : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching admin data" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const photoFile = formData.get("photo") as File;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (photoFile.size > maxSize) {
      return NextResponse.json({ error: "Photo size must be less than 5MB" }, { status: 400 });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert image file to buffer
    let buffer = null;
    if (photoFile) {
      const arrayBuffer = await photoFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Create admin in DB
    const newAdmin = await prisma.admin.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        photo: buffer,
        role: "admin",
      },
    });

    return NextResponse.json({ message: "Admin created successfully!", admin: newAdmin });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
