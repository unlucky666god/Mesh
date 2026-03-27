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
            skip: beforeId ? 1 : 0,
            cursor: beforeId ? { id: beforeId } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { // Подгружаем автора сообщения
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            senderId: msg.senderId === decoded.id ? 'me' : msg.senderId,
            text: msg.content,
            timestamp: msg.createdAt.toISOString().replace('Z', ''),
            status: msg.status.toLowerCase() as 'sent' | 'delivered' | 'read',
            sender: {
                name: msg.sender.name,
                avatar: msg.sender.avatar
            }
        })).reverse();

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}