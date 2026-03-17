import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

const generateToken = (id: string) => {
    return sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return Response.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = generateToken(user.id);

        const response = NextResponse.json({ message: "Login successful" });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30, // 30 дней
            sameSite: 'strict', // вместо `strict` как standalone
            path: '/',           // путь доступа cookie
        });

        return response;
    } catch (error) {
        console.error("Login error:", error); // Логирование ошибки
        return Response.json({ error: "Server error" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}