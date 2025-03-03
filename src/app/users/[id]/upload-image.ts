import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { stat } from "fs";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("profilePicture") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save BLOB in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: buffer },
    });

    // Convert BLOB to Base64 for frontend
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    return NextResponse.json({ profilePicture: base64Image }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ message: "Error uploading image" }, { status: 500 });
  }
}


