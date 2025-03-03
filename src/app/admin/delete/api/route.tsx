import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    // Count the number of admins
    const adminCount = await prisma.admin.count();

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "At least one admin is required. Cannot delete the last admin." },
        { status: 400 }
      );
    }

    // Proceed with deletion
    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete admin" }, { status: 500 });
  }
}
