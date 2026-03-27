// app/api/conversations/group/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
        const { name, participantIds } = await req.json();

        // 1. Валидация
        if (!name || !participantIds || !Array.isArray(participantIds)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // 2. Генерируем уникальный инвайт-код
        const inviteCode = crypto.randomBytes(4).toString('hex');

        // 3. Создаем всё одной транзакцией
        const newGroup = await prisma.$transaction(async (tx) => {
            // Создаем беседу
            const conversation = await tx.conversation.create({
                data: {
                    type: "GROUP",
                    name: name,
                    inviteCode: inviteCode,
                }
            });

            // Добавляем создателя (тебя) как OWNER
            await tx.participant.create({
                data: {
                    userId: decoded.id,
                    conversationId: conversation.id,
                    role: "OWNER"
                }
            });

            // Добавляем выбранных друзей как MEMBER
            if (participantIds.length > 0) {
                await tx.participant.createMany({
                    data: participantIds.map((id: string) => ({
                        userId: id,
                        conversationId: conversation.id,
                        role: "MEMBER"
                    }))
                });
            }

            return conversation;
        });

        return NextResponse.json(newGroup);
    } catch (error: any) {
        console.error("GROUP_CREATE_ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}