import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Fetch posts error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
        const { content, image } = await req.json();

        if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorId: decoded.id
            },
            include: {
                author: {
                    select: { id: true, name: true, avatar: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });

        return NextResponse.json({ post });
    } catch (error) {
        console.error("Create post error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
