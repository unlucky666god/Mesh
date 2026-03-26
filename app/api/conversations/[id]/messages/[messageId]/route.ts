// app/api/conversations/[id]/messages/[messageId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../../lib/prisma";

// app/api/conversations/[id]/messages/[messageId]/route.ts
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; messageId: string }> } // Указываем, что это Promise
) {
    try {
        // 1. ОБЯЗАТЕЛЬНО дожидаемся параметров
        const { id: conversationId, messageId } = await params;

        console.log("Получен messageId:", messageId); // Теперь тут будет ID, а не undefined

        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };

        // 2. Теперь Prisma получит реальную строку
        const message = await prisma.message.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.senderId !== decoded.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.message.delete({
            where: { id: messageId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("ПОЛНАЯ ОШИБКА ПРИЗМЫ:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const { messageId } = await params;
        const { text } = await req.json();

        if (!text?.trim()) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const token = req.cookies.get("token")?.value;
        const decoded = verify(token!, process.env.JWT_SECRET!) as { id: string };

        // Проверяем, что сообщение существует и принадлежит пользователю
        const message = await prisma.message.findUnique({ where: { id: messageId } });

        if (!message || message.senderId !== decoded.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Обновляем в БД
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content: text }
        });

        return NextResponse.json({ success: true, message: updatedMessage });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}