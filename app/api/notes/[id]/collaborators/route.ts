import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get collaborators for a note
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const collaborators = note.team?.members.map((member) => member.user) || [];
    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborators" },
      { status: 500 }
    );
  }
}

// Add a collaborator to a note
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = await request.json();

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: { team: true },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Create team if it doesn't exist
    let teamId = note.teamId;
    if (!teamId) {
      const team = await prisma.team.create({
        data: {
          name: `${note.title}'s Team`,
          notes: {
            connect: { id: note.id },
          },
        },
      });
      teamId = team.id;
    }

    // Add user to team
    await prisma.teamMember.create({
      data: {
        teamId: teamId,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: "Collaborator added successfully" });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

// Remove a collaborator from a note
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { userId } = await request.json();

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: noteId,
          userId,
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