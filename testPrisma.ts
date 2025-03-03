import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.users.findMany();
    console.log("Connected! Users:", users);
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
