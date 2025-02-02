import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Remove a collaborator from a note
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: { team: true },
    });

    if (!note || !note.teamId) {
      return NextResponse.json({ error: "Note or team not found" }, { status: 404 });
    }

    // Remove user from team
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: note.teamId,
          userId: params.userId,
        },
      },
    });

    return NextResponse.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
} 