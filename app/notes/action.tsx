import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function getTaskbyUserId(userId: string) {
    const notes = await prisma.note.findMany({
        where: {
            userId: userId
        }
    })
    return NextResponse.json(notes)
}