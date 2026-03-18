import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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
            include: {
                sender: { select: { id: true, name: true, avatar: true } }
            },
            orderBy: { createdAt: "asc" }
        });

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            senderId: msg.senderId === decoded.id ? 'me' : msg.senderId,
            text: msg.content,
            timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: msg.status.toLowerCase() as 'sent' | 'delivered' | 'read'
        }));

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
