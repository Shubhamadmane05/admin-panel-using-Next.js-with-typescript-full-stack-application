import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

const parseCSV = (csvText: string) => {
  const rows = csvText.replace(/\r\n/g, "\n").split("\n").filter(row => row.trim() !== "");
  const headers = rows[0].split(",").map(header => header.replace(/"/g, "").trim());
  
  const requiredHeaders = ["name", "email", "status"];
  if (!requiredHeaders.every((header) => headers.includes(header))) {
    throw new Error("Invalid CSV headers. Required headers: name, email, status");
  }

  const data: { [x: string]: string; }[] = [];
  const errors: { rowNumber: number; message: string; rowData?: { [x: string]: string; }; }[] = [];

  rows.slice(1).forEach((row: string, index: number) => {
    //Splits columns and removes extra spaces.
    const columns = row.split(",").map(col => col.replace(/"/g, "").trim());
    if (columns.length !== headers.length) {
      errors.push({ rowNumber: index + 2, message: "Invalid number of columns" });
      return;
    }

    const record = headers.reduce((acc: { [x: string]: string; }, header: string | number, colIndex: string | number) => {
      acc[header] = columns[colIndex] || "";
      return acc;
    }, {});

    if (!record.name) {
      errors.push({ rowNumber: index + 2, message: "Missing required field: name", rowData: record });
    }
    if (!record.email) {
      errors.push({ rowNumber: index + 2, message: "Missing required field: email", rowData: record });
    }
    if (!record.status) {
      errors.push({ rowNumber: index + 2, message: "Missing required field: status", rowData: record });
    }
    
    // If any errors were added, return early to avoid further processing
    if (errors.some(error => error.rowNumber === index + 2)) {
      return;
    }
    

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(record.email)) {
      errors.push({ rowNumber: index + 2, message: "Invalid email format", rowData: record });
      return;
    }

    if (!["active", "inactive"].includes(record.status.toLowerCase())) {
      errors.push({ rowNumber: index + 2, message: "Invalid status. Only 'Active' or 'Inactive' allowed", rowData: record });
      return;
    }

    data.push(record);
  });

  return { data, errors };
};

const filterDuplicates = async (newData: any[]) => {
  const existingUsers = await prisma.user.findMany({ select: { email: true } });
  const existingEmails = new Set(existingUsers.map(user => user.email));
  
  const duplicates = newData.filter(user => existingEmails.has(user.email));
  const uniqueRecords = newData.filter(user => !existingEmails.has(user.email));
  
  return { uniqueRecords, duplicates };
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const csvText = await file.text();
    let parsedData;
    try {
      parsedData = parseCSV(csvText);
    } catch (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const { data: newUsers, errors: validationErrors } = parsedData;
    const { uniqueRecords, duplicates } = await filterDuplicates(newUsers);

    // Fetch existing users to determine max ID
    const existingData = await prisma.user.findMany({ select: { id: true } });
    const maxExistingId = existingData.reduce((maxId: number, user: { id: number }) => (user.id > maxId ? user.id : maxId), 0);

    // Assign new incremented IDs
    const updatedUsers = uniqueRecords.map((user, index) => ({
      id: maxExistingId + index + 1,
      name: user.name,
      email: user.email,
      status: user.status,
    }));

    const createdUsers = await prisma.user.createMany({
      data: updatedUsers,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: "CSV data processed",
      totalRecords: newUsers.length,
      addedRecords: createdUsers.count,
      duplicates: duplicates,
      skipped: validationErrors.length,
      errors: validationErrors,
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
