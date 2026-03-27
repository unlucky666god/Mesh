// app/api/users/followers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };

        // Ищем всех, кто подписан НА МЕНЯ
        const followersLinks = await prisma.follow.findMany({
            where: {
                followingId: decoded.id // Тот, на кого подписаны — это я
            },
            include: {
                follower: { // Берем данные того, КТО подписался (подписчика)
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        status: true
                    }
                }
            }
        });

        // Извлекаем объекты пользователей (follower)
        const users = followersLinks.map(link => link.follower);

        return NextResponse.json(users);
    } catch (error) {
        console.error("Fetch followers error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}