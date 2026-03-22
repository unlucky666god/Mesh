import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "25");
        const beforeId = searchParams.get("beforeId"); // ID самого старого сообщения в текущем списке

        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
        const { id: conversationId } = await params;

        // Проверяем, участвует ли пользователь в чате
        const participant = await prisma.participant.findUnique({
            where: { userId_conversationId: { userId: decoded.id, conversationId } }
        });

        if (!participant) return NextResponse.json({ error: "Access denied" }, { status: 403 });

        const messages = await prisma.message.findMany({
            where: { conversationId },
            take: limit,
            // Если передан beforeId, пропускаем его и берем те, что были ДО него
            ...(beforeId && {
                skip: 1,
                cursor: { id: beforeId },
            }),
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: "desc" } // Сначала берем самые свежие
        });

        const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId === decoded.id ? 'me' : msg.senderId,
            text: msg.content,
            // Сохраняем дату как ISO для сортировки на фронте, если нужно
            timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: msg.status.toLowerCase() as 'sent' | 'delivered' | 'read'
        })).reverse(); // Переворачиваем обратно, чтобы в чате был правильный порядок (asc)

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
