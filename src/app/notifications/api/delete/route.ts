import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    await prisma.notification.deleteMany(); // Deletes all notifications

    return NextResponse.json({ message: "All notifications cleared" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}
