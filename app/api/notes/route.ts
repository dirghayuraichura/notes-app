import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"

// Get user's own notes
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 });
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            fullName: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const transformedNotes = notes.map(note => ({
      ...note,
      isOwner: true,
      collaborators: [],
      owner: {
        email: note.user.email,
        fullName: note.user.fullName
      }
    }));

    return NextResponse.json(transformedNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { title, content, category, userId } = await request.json()

  if (!title || !content || !userId) {
    return NextResponse.json({ error: "Title, content, and userId are required" }, { status: 400 })
  }

  try {
    const createdNote = await prisma.note.create({
      data: {
        title,
        content,
        category,
        user: { connect: { id: userId } }
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true
          }
        }
      }
    });

    return NextResponse.json({
      ...createdNote,
      isOwner: true,
      collaborators: []
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



