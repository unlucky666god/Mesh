import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/prisma";
import { ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const generateToken = (id: string) => {
    return sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

export async function POST(req: NextRequest) {
    try {
        const { email, password, name, phone } = await req.json();

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone },
                    { name }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return Response.json({ error: "User with this email already exists" }, { status: 400 });
            }
            if (existingUser.phone === phone) {
                return Response.json({ error: "User with this phone already exists" }, { status: 400 });
            }
            if (existingUser.name === name) {
                return Response.json({ error: "User with this name already exists" }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                createdAt: new Date(),
            },
        });

        const token = generateToken(user.id);

        const response = NextResponse.json({ message: "Registration successful" });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'strict',
            path: '/',
        })

        return response;
    } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
    }
}