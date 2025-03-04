import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { notifyUser } from "@/app/lib/websockets/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const session = await getServerSession(authOptions); 

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedBy = session.user.name || session.user.email; // Admin performing the update

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check for email duplication
    const isEmailTaken = await prisma.user.findFirst({
      where: { email: body.email, id: { not: userId } },
    });

    if (isEmailTaken) {
      return NextResponse.json({ message: "Email is already registered!" }, { status: 400 });
    }

    // Capture only the modified fields
    const changes: Record<string, any> = {};
    if (body.name !== existingUser.name) changes.name = body.name;
    if (body.email !== existingUser.email) changes.email = body.email;
    if (body.status !== existingUser.status) changes.status = body.status;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
    });

    // Send WebSocket notification only if changes were made
   // Send WebSocket notification only if changes were made
if (Object.keys(changes).length > 0 && updatedBy && userId) {
  notifyUser({ userId, updatedBy, changes });
}


    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}


// Delete user
export async function DELETE(req: NextRequest, { params }: { params: { userid: string } }) {
  try {
    const userId = parseInt(params.userid);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { userid: string } }) {
  try {
    const userId = parseInt(params.userid);

    if (isNaN(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const base64Image = user.profilePicture
      ? `data:image/png;base64,${Buffer.from(user.profilePicture).toString("base64")}`
      : null;

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        profilePicture: base64Image, 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Error fetching user" }, { status: 500 });
  }
}

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

    // Save image as BLOB in database
    await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: buffer },
    });

    return NextResponse.json({ message: "Image uploaded successfully" }, { status: 200 }); // ✅ No Base64 returned
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ message: "Error uploading image" }, { status: 500 });
  }
}
