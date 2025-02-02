import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"

// Get notes shared with the user through team membership
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  try {
    // Get notes where the user is a team member but not the owner
    const sharedNotes = await prisma.note.findMany({
      where: {
        AND: [
          {
            team: {
              members: {
                some: {
                  userId: userId as string
                }
              }
            }
          },
          {
            userId: {
              not: userId as string
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true
          }
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(sharedNotes);
  } catch (error) {
    console.error("Error fetching shared notes:", error);
    return NextResponse.json({ error: "Failed to fetch shared notes" }, { status: 500 });
  }
} 