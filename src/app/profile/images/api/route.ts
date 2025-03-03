import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = parseInt(params.id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    
    let user = await prisma.admin.findUnique({
      where: { id: userId },
      select: { photo: true },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true },
      });
    }

    if (!user || (!user.photo && !user.profilePicture)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const imageData = user.photo || user.profilePicture;

    
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": "image/jpeg", 
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
