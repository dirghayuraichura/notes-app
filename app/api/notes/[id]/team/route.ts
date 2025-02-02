import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get team members
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;

    const note = await prisma.note.findUnique({
      where: { id: noteId },
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

    if (!note?.team) {
      return NextResponse.json([]);
    }

    const members = note.team.members.map((member) => member.user);
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// Add team member
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { userId } = await request.json();

    // Get or create team
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { team: true },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    let teamId = note.team?.id;
    if (!teamId) {
      const team = await prisma.team.create({
        data: {
          name: `Note ${noteId} Team`,
          notes: {
            connect: { id: noteId },
          },
        },
      });
      teamId = team.id;
    }

    // Add member to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
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

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

// Remove team member
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { userId } = await request.json();

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { team: true },
    });

    if (!note?.team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: note.team.id,
          userId,
        },
      },
    });

    return NextResponse.json({ message: "Team member removed successfully" });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
} 