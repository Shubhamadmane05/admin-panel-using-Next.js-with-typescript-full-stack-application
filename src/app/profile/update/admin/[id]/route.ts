import { prisma } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json({ message: "Invalid admin ID" }, { status: 400 });
        }

        const body = await req.json();
        if (!body.name || !body.email) {
            return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
        }

        const existingAdmin = await prisma.admin.findUnique({ where: { id: userId } });
        if (!existingAdmin) {
            return NextResponse.json({ message: "Admin not found" }, { status: 404 });
        }

        const isEmailTaken = await prisma.admin.findFirst({
            where: { email: body.email, id: { not: userId } },
        });

        if (isEmailTaken) {
            return NextResponse.json({ message: "Email already registered" }, { status: 409 });
        }

        let photoBuffer: Buffer | null = null;
        if (body.profilePicture) { // Corrected this line
            const base64String = body.profilePicture.split(",")[1];
            if (base64String) {
                photoBuffer = Buffer.from(base64String, "base64");
            }
        }

        const updatedAdmin = await prisma.admin.update({
            where: { id: userId },
            data: {
                fullName: body.name,
                email: body.email,
                photo: photoBuffer ?? existingAdmin.photo,
            },
        });

        return NextResponse.json({ message: "Admin profile updated successfully", admin: updatedAdmin }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating admin profile:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}