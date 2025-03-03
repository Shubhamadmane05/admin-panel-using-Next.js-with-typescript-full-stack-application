import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    // Access params asynchronously
    const { params } = context; 

    if (!params?.id) {
      return NextResponse.json({ error: "Missing admin ID" }, { status: 400 });
    }

    // Convert ID to a number if Prisma expects an integer
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true, name:true, email: true,status:true },
    });

    if (!user || !user.profilePicture) {
      return NextResponse.json({ error: "No image available" }, { status: 404 });
    }

    // Convert BLOB to Base64
    const base64Image = Buffer.from(user.profilePicture).toString("base64");

    return NextResponse.json({ 
      photo: base64Image,
        name: user.name,
        email: user.email,
        status: user.status,

     });
  } catch (error) {
    console.error("Error fetching admin photo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
