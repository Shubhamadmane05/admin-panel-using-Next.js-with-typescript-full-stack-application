// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// const prisma = new PrismaClient();

// export async function GET(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const admin = await prisma.admin.findUnique({
//       where: { id: session.user.id },
//       select: { id: true, name: true, email: true, photo: true },
//     });

//     if (!admin) {
//       return NextResponse.json({ error: "Admin not found" }, { status: 404 });
//     }

//     return NextResponse.json({ ...admin, profilePicture: admin.photo });
//   } catch (error) {
//     console.error("Error fetching admin profile:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }









// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== "admin") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const admin = await prisma.admin.findUnique({
//     where: { email: session.user.email },
//     select: { fullName: true, email: true, photo: true },
//   });

//   if (!admin) {
//     return NextResponse.json({ error: "Admin not found" }, { status: 404 });
//   }

//   // Convert binary (BLOB) data to Base64
//   const base64Image = admin.photo
//     ? `data:image/jpeg;base64,${Buffer.from(admin.photo).toString("base64")}`
//     : null;

//   return NextResponse.json({
//     name: admin.fullName,
//     email: admin.email,
//     photo: base64Image,
//   });
// }
