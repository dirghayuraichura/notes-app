import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addDays } from "date-fns";

// Send invitation
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const { email, invitedBy } = await request.json();

    // First, find the note and its team
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { team: true }
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    // Check if user is already a collaborator
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        teams: {
          some: {
            teamId: note.teamId || ''
          }
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User is already a collaborator" },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        noteId,
        status: "PENDING"
      }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Invitation already sent" },
        { status: 400 }
      );
    }

    // Create team if it doesn't exist
    let teamId = note.teamId;
    if (!teamId) {
      const team = await prisma.team.create({
        data: {
          name: `Note ${note.id} Team`,
          notes: {
            connect: { id: note.id }
          }
        }
      });
      teamId = team.id;
    }

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        noteId,
        invitedBy,
        expiresAt: addDays(new Date(), 7),
        status: "PENDING"
      }
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// Get invitations for a note
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const invitations = await prisma.invitation.findMany({
      where: {
        noteId,
        status: "PENDING"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
} 