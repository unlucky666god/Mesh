import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: conversationId } = await params;

    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };

        // Находим чат и подтягиваем участников через таблицу связей Participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Проверка: состоит ли запрашивающий юзер в этом чате
        const isParticipant = conversation.participants.some(p => p.userId === decoded.id);
        if (!isParticipant) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Форматируем для фронтенда
        const members = conversation.participants.map(p => ({
            id: p.userId,
            name: p.user.name,
            avatar: p.user.avatar,
            role: p.role // OWNER, ADMIN, MEMBER
        }));

        return NextResponse.json({ members });
    } catch (error) {
        console.error("Fetch members error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}