// app/api/invite/[code]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const { code } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };

  const conversation = await prisma.conversation.findUnique({
    where: { inviteCode: code }
  });

  if (!conversation) return NextResponse.json({ error: "Invite link invalid" }, { status: 404 });

  // Добавляем пользователя, если его там еще нет
  await prisma.participant.upsert({
    where: {
      userId_conversationId: {
        userId: decoded.id,
        conversationId: conversation.id
      }
    },
    update: {},
    create: {
      userId: decoded.id,
      conversationId: conversation.id,
      role: "MEMBER"
    }
  });

  // Перенаправляем в мессенджер к этому чату
  return NextResponse.redirect(new URL(`/messenger?chatId=${conversation.id}`, req.url));
}