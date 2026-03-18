import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../lib/prisma";
import { ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

const generateToken = (id: string) => {
    return sign({ id }, process.env.JWT_SECRET!, { expiresIn: '30d' });
};

export async function POST(req: NextRequest) {
    try{
        const { email, password, name, phone } = await req.json();

        const existingUser = await prisma.user.findUnique({ where: { email }});

        if(existingUser) {
            return Response.json({ error: "User already exists" }, { status: 400 });
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
    } catch(error) {
        return Response.json({ error: "Server error"}, { status: 500});
    }
}