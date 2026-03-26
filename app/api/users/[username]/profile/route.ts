import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Декодируем ID пользователя из токена
    const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
    const userId = decoded.id;

    const body = await req.json();
    const { name, bio, phone } = body;

    // Валидация: если меняется имя, проверяем уникальность
    if (name) {
      const existing = await prisma.user.findFirst({
        where: { 
          name,
          NOT: { id: userId } // Ищем среди других юзеров
        }
      });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    // Обновляем в БД
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name?.trim(),
        bio: bio?.trim(),
        phone: phone ? phone.replace(/\D/g, '') : undefined, // Чистим телефон
      },
    });

    return NextResponse.json({ 
      message: "Profile updated", 
      user: { name: updatedUser.name, bio: updatedUser.bio } 
    });

  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}