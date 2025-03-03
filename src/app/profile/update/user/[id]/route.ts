import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
        }

        const body = await req.json();
        if (!body.name || !body.email) {
            return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if email is already taken by another user
        const isEmailTaken = await prisma.user.findFirst({
            where: { email: body.email, id: { not: userId } },
        });

        if (isEmailTaken) {
            return NextResponse.json({ message: "Email already registered" }, { status: 409 });
        }

        // Convert base64 image to buffer (if provided)
        let photoBuffer: Buffer | null = null;
        if (body.profilePicture) {
            const base64String = body.profilePicture.split(",")[1];
            if (base64String) {
                photoBuffer = Buffer.from(base64String, "base64");
            }
        }

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: body.name,
                email: body.email,
                profilePicture: photoBuffer ?? existingUser.profilePicture,
            },
        });

        return NextResponse.json({ message: "Profile updated successfully", user: updatedUser }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
