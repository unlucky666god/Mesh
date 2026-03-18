import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } }
                ]
            },
            select: {
                id: true,
                name: true,
                avatar: true
            },
            take: 5
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Search users error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
