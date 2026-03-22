import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };

        const participations = await prisma.participant.findMany({
            where: { userId: decoded.id },
            include: {
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: { id: true, name: true, avatar: true, status: true }
                                }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: "desc" },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { conversation: { updatedAt: "desc" } }
        });

        const chats = participations.map(p => {
            const other = p.conversation.participants.find(p2 => p2.userId !== decoded.id);
            return {
                id: p.conversationId,
                type: p.conversation.type,
                name: p.conversation.type === "PRIVATE" ? other?.user.name : p.conversation.name,
                avatar: p.conversation.type === "PRIVATE" ? other?.user.avatar : p.conversation.avatar,
                lastMessage: p.conversation.messages[0]?.content || "No messages yet",
                time: p.conversation.messages[0]?.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "New",
                online: other?.user.status === "online",
                unread: 0 // TODO: Add unread count logic
            };
        });

        return NextResponse.json({ chats });
    } catch (error) {
        console.error("Fetch conversations error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
        const { recipientId, name, type = "PRIVATE" } = await req.json();

        // Проверяем, существует ли уже приватный чат
        if (type === "PRIVATE") {
            const existing = await prisma.conversation.findFirst({
                where: {
                    type: "PRIVATE",
                    participants: { every: { userId: { in: [decoded.id, recipientId] } } }
                }
            });
            if (existing) return NextResponse.json({ conversation: existing });
        }

        const conversation = await prisma.conversation.create({
            data: {
                type,
                name,
                participants: {
                    create: [
                        { userId: decoded.id, role: "ADMIN" },
                        { userId: recipientId, role: "MEMBER" }
                    ]
                }
            }
        });

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error("Create conversation error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
