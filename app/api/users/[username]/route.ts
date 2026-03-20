import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verify } from "jsonwebtoken";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;

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

        const token = req.cookies.get("token")?.value;
        let isFollowing = false;
        let isMe = false;
        if (token) {
            try {
                const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
                isMe = decoded.id === user.id;
                
                const follow = await prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: decoded.id,
                            followingId: user.id
                        }
                    }
                });
                isFollowing = !!follow;
            } catch (e) {}
        }

        return NextResponse.json({ 
            user: {
                ...user,
                isFollowing,
                isMe
            } 
        });
    } catch (error) {
        console.error("Fetch user error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
