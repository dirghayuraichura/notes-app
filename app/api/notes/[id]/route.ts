import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: { id: string } }) {
 
try {
  const note = await prisma.note.findUnique({
    where: { id: params.id },
  })

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }

  return NextResponse.json(note)
} catch (error) {
  console.error("Error fetching note:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
try {
    const { title, content, category } = await request.json()
    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: { title, content, category },
    })
    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }

}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.note.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

