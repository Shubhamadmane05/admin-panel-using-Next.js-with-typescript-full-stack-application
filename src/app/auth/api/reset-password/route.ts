// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const { token, password } = await req.json();

//     if (!token || !password) {
//       return NextResponse.json({ message: "Token and password required" }, { status: 400 });
//     }

//     // Check if token exists and is valid
//     const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
//     if (!resetToken || resetToken.expires < new Date()) {
//       return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
//     }

//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Update user password
//     await prisma.user.update({
//       where: { id: resetToken.userId },
//       data: { password: hashedPassword },
//     });

//     // Delete used token
//     await prisma.passwordResetToken.delete({ where: { token } });

//     return NextResponse.json({ message: "Password updated successfully!" });
//   } catch (error) {
//     console.error("Error updating password:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password required" }, { status: 400 });
    }

    // Check if token exists and is valid
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists in User model
    let user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
    let role = "user";

    // If not found, check in Admin model
    if (!user) {
      user = await prisma.admin.findUnique({ where: { id: resetToken.userId } });
      role = "admin";
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update password based on the role (user/admin)
    if (role === "user") {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.admin.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Delete used token
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
