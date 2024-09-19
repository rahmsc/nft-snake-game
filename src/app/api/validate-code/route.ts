import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const validCode = await db.code.findUnique({
      where: { code: code },
    });

    if (validCode && !validCode.used) {
      // Mark the code as used
      await db.code.update({
        where: { id: validCode.id },
        data: { used: true, usedAt: new Date() },
      });

      return NextResponse.json({ valid: true });
    }
    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error("Error validating code:", error);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
