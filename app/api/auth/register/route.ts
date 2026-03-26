import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

const generateToken = (id: string) => {
    // Безопасная проверка секрета
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in environment variables");
    }
    return sign({ id }, secret, { expiresIn: '30d' });
};

const formatPhone = (phone: string | undefined | null) => {
    if (!phone) return null;
    return phone.replace(/\D/g, ''); // \D — это любой символ, кроме цифры
};

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, phone: rawPhone } = await req.json();

        // Проверка на наличие данных
        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Нормализация данных
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = formatPhone(rawPhone);
        const normalizedName = name.trim();

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { phone: normalizedPhone},
                    { name: normalizedName }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
            }
            if (rawPhone && existingUser.phone === rawPhone) {
                return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 });
            }
            if (existingUser.name === name) {
                return NextResponse.json({ error: "User with this name already exists" }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                phone: normalizedPhone,
                password: hashedPassword,
                // createdAt обычно прописывается по умолчанию в схеме Prisma, 
                // но оставить здесь не ошибка
            },
        });

        const token = generateToken(user.id);

        const response = NextResponse.json(
            { message: "Registration successful" },
            { status: 201 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}