import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

function generateUniqueCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST() {
  try {
    const code = generateUniqueCode();

    const newCode = await db.code.create({
      data: {
        code: code,
        used: false,
      },
    });

    return NextResponse.json({ code: newCode.code }, { status: 200 });
  } catch (error) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}
