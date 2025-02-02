import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Update cursor position
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { userId, x, y } = await request.json();

    const cursor = await prisma.cursorPosition.upsert({
      where: {
        userId_noteId: {
          userId,
          noteId,
        },
      },
      update: {
        x,
        y,
      },
      create: {
        userId,
        noteId,
        x,
        y,
      },
    });

    return NextResponse.json(cursor);
  } catch (error) {
    console.error("Error updating cursor position:", error);
    return NextResponse.json(
      { error: "Failed to update cursor position" },
      { status: 500 }
    );
  }
}

// Get all cursors for a note
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const cursors = await prisma.cursorPosition.findMany({
      where: {
        noteId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(cursors);
  } catch (error) {
    console.error("Error fetching cursors:", error);
    return NextResponse.json(
      { error: "Failed to fetch cursors" },
      { status: 500 }
    );
  }
} 