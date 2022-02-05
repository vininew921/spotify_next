import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export const middleware = async (req: any) => {
    const token = await getToken({ req, secret: process.env.JWT_SECRET! });

    const { pathname } = req.nextUrl;

    if (token && pathname === '/login') {
        return NextResponse.redirect('/');
    }

    // If token exists or it's an auth request, allow request
    if (pathname.includes('/api/auth') || token) {
        return NextResponse.next();
    }

    if (!token && pathname !== '/login') {
        return NextResponse.redirect('/login');
    }
};
