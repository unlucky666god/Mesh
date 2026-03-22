import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";
export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
        const { username } = await params;

        const targetUser = await prisma.user.findUnique({ where: { name: username } });
        if (!targetUser) return NextResponse.json({ error: "Target user not found" }, { status: 404 });

        const isFollowing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: decoded.id,
                    followingId: targetUser.id
                }
            }
        });

        if (isFollowing) {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: decoded.id,
                        followingId: targetUser.id
                    }
                }
            });
            return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false });
        } else {
            await prisma.follow.create({
                data: {
                    followerId: decoded.id,
                    followingId: targetUser.id
                }
            });
            return NextResponse.json({ message: "Followed successfully", isFollowing: true });
        }
    } catch (error) {
        console.error("Follow error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
