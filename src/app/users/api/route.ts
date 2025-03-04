import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
//  import { notifyClients } from "@/app/polling/api/route";
import { notifyAdmin } from "@/app/lib/websockets/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany(); 
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching users", error },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const department = formData.get("department") as string;
    const password = formData.get("password") as string;
    const status = formData.get("status") as string;
    const profilePicture = formData.get("profilePicture");

    if (!name || !email || !status || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!(profilePicture instanceof File)) {
      return NextResponse.json({ error: "Invalid file upload" }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await profilePicture.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Failed to process file" }, { status: 400 });
    }

    // Ensure email is unique
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (profilePicture.size > maxSize) {
      return NextResponse.json({ error: "Photo size must be less than 5MB" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // max id
    const lastUser = await prisma.user.findFirst({
      orderBy: { id: "desc" },
      select: { id: true },
    });

    const nextId = lastUser ? lastUser.id + 1 : 1;

    // Save user 
    const newUser = await prisma.user.create({
      data: { 
        id: nextId, 
        name, 
        email, 
        department,
        password: hashedPassword, 
        status, 
        role: "user", 
        profilePicture: buffer 
      },
    });
    
    let adminsToNotify;

    if (department === "ALL") {
      adminsToNotify = await prisma.admin.findMany({
        select: { id: true, department: true },
      });
    
      await prisma.notification.upsert({
        where: {
          userId_userDepartment: {
            userId: newUser.id,
            userDepartment: newUser.department, 
          },
        },
        update: {}, // If exists
        create: {
          userId: newUser.id,
          userName: newUser.name,
          userEmail: newUser.email,
          userDepartment: newUser.department, 
          isRead: false,
        },
      });
    
    
      const uniqueDepartments = new Set(adminsToNotify.map(admin => admin.department));
    
  
      for (const dept of uniqueDepartments) {
        await prisma.notification.upsert({
          where: {
            userId_userDepartment: {
              userId: newUser.id,
              userDepartment: dept, 
            },
          },
          update: {}, // If exists
          create: {
            userId: newUser.id,
            userName: newUser.name,
            userEmail: newUser.email,
            userDepartment: newUser.department, 
            isRead: false,
          },
        });
      }
    } else {
      
      adminsToNotify = await prisma.admin.findMany({
        where: { department },
        select: { id: true, department: true },
      });
    }
    
    // Avoid duplicate department notifications
    const notifiedDepartments = new Set<string>();
    
    for (const admin of adminsToNotify) {
      await notifyAdmin({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: department === "ALL" ? "All Departments" : newUser.department,
      });
    
      if (!notifiedDepartments.has(admin.department)) {
        notifiedDepartments.add(admin.department);
    
        await prisma.notification.upsert({
          where: {
            userId_userDepartment: {
              userId: newUser.id,
              userDepartment: admin.department,
            },
          },
          update: {},
          create: {
            userId: newUser.id,
            userName: newUser.name,
            userEmail: newUser.email,
            userDepartment: newUser.department,
            isRead: false,
          },
        });
      }
    }
     
    return NextResponse.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    
    return NextResponse.json({ error: "Error saving user" }, { status: 500 });
  }
}