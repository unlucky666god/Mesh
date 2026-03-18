import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const { username } = params;

        const user = await prisma.user.findUnique({
            where: { name: username },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                cover: true,
                createdAt: true,
                _count: {
                    select: { posts: true, followers: true, following: true }
                },
                posts: {
                  orderBy: { createdAt: 'desc' },
                  include: {
                    author: { select: { id: true, name: true, avatar: true } },
                    _count: { select: { likes: true, comments: true } }
                  }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Fetch user error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
