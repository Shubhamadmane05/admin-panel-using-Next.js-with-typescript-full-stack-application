import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Extract admin's department from query or headers
    const url = new URL(req.url);
    const adminDepartment = url.searchParams.get("department");

    if (!adminDepartment) {
      return NextResponse.json({ error: "Admin department is required" }, { status: 400 });
    }

    // Fetch only notifications for the admin's department or "All"
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userDepartment: adminDepartment }, // Admin's department
          { userDepartment: "All" }, // Global notifications
        ],
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
      select: {
        userId: true, 
        userName: true,
        userEmail: true,
        userDepartment: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
