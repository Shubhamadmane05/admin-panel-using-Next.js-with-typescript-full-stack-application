import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    console.log("Received search query:", query);

    if (!query) {
      return NextResponse.json({ message: "Query parameter is required" }, { status: 400 });
    }

    //Ensure Prisma is querying correctly
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: !isNaN(Number(query)) ? Number(query) : undefined }, 
          { name: { contains: query } },
          { email: { contains: query } },
          { status: { contains: query } },
        ].filter(Boolean), 
      },
    });
    
    console.log("Found users:", users);

    // Ensure the response is always an array
    return NextResponse.json(users.length > 0 ? users : []);
  } catch (error: any) {
    console.error(" Prisma Error:", error);

    return NextResponse.json(
      { message: "Internal server error", error: error.message || String(error) },
      { status: 500 }
    );
  }
}
