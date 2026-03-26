import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

// Эти настройки важны, чтобы Next.js не пытался пре-рендерить API роут
export const dynamic = 'force-dynamic';

const generateToken = (id: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    return sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Важно: bcrypt.compare — асинхронная функция, лучше использовать её
        const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isPasswordValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = generateToken(user.id);

        const response = NextResponse.json(
            { message: "Login successful" },
            { status: 200 }
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
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}