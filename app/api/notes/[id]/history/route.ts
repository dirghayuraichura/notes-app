import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Add entry to note history
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { title, content, version, userId } = await request.json();

    // Create history entry
    const historyEntry = await prisma.noteHistory.create({
      data: {
        title,
        content,
        version,
        noteId,
        userId,
      },
    });

    // Update note version
    await prisma.note.update({
      where: { id: noteId },
      data: { version },
    });

    return NextResponse.json(historyEntry);
  } catch (error) {
    console.error("Error creating history entry:", error);
    return NextResponse.json(
      { error: "Failed to create history entry" },
      { status: 500 }
    );
  }
}

// Get note history
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const history = await prisma.noteHistory.findMany({
      where: {
        noteId,
      },
      orderBy: {
        version: "desc",
      },
      include: {
        note: {
          select: {
            title: true,
            content: true,
            version: true,
          },
        },
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching note history:", error);
    return NextResponse.json(
      { error: "Failed to fetch note history" },
      { status: 500 }
    );
  }
}

// Revert to specific version
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { version } = await request.json();

    // Find the historical version
    const historyEntry = await prisma.noteHistory.findFirst({
      where: {
        noteId,
        version,
      },
    });

    if (!historyEntry) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Update note with historical version
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: historyEntry.title,
        content: historyEntry.content,
        version: historyEntry.version,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error reverting note version:", error);
    return NextResponse.json(
      { error: "Failed to revert note version" },
      { status: 500 }
    );
  }
} 