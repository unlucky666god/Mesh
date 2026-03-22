import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Сначала дожидаемся параметров роута
    const { id: conversationId } = await params;

    try {
        const { searchParams } = new URL(req.url);
        const limitStr = searchParams.get("limit");
        const limit = limitStr ? parseInt(limitStr, 10) : 25;
        const beforeId = searchParams.get("beforeId");

        // 2. Доступ к кукам в API роутах
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const decoded = verify(token, process.env.JWT_SECRET) as { id: string };

        // 3. Проверка участника
        const participant = await prisma.participant.findUnique({
            where: {
                userId_conversationId: {
                    userId: decoded.id,
                    conversationId: conversationId
                }
            }
        });

        if (!participant) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // 4. Запрос сообщений с безопасным курсором
        const messages = await prisma.message.findMany({
            where: { conversationId },
            take: limit,
            ...(beforeId && beforeId !== "undefined" ? {
                skip: 1,
                cursor: { id: beforeId },
            } : {}),
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            senderId: msg.senderId === decoded.id ? 'me' : msg.senderId,
            text: msg.content,
            timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: msg.status.toLowerCase() as 'sent' | 'delivered' | 'read'
        })).reverse();

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}