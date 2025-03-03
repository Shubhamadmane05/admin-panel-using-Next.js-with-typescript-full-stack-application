import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "user") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, profilePicture: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Convert binary (BLOB) data to Base64
  const base64Image = user.profilePicture
    ? `data:image/jpeg;base64,${Buffer.from(user.profilePicture).toString("base64")}`
    : null;

  return NextResponse.json({
    name: user.name,
    email: user.email,
    profilePicture: base64Image,
  });
}
