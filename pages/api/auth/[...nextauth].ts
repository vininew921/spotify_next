import NextAuth, { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import SpotifyProvider from 'next-auth/providers/spotify';
import spotifyAPI, { LOGIN_URL } from '../../../lib/spotify';

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        username: string;
        accessTokenExpires: number;
        error?: string;
    }
}

declare module 'next-auth' {
    interface Session {
        user: {
            accessToken: string;
            refreshToken: string;
            username: string;
            image: string;
            name: string;
        };
        error: string;
    }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        spotifyAPI.setAccessToken(token.accessToken);
        spotifyAPI.setRefreshToken(token.refreshToken);

        const { body: refreshedToken } = await spotifyAPI.refreshAccessToken();

        console.log('Refresh token is ', refreshedToken);

        return {
            token: token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
            username: token.username,
        };
    } catch (error) {
        console.error(error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export default NextAuth({
    providers: [
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET!,
            authorization: LOGIN_URL,
        }),
    ],
    secret: process.env.JWT_SECRET as string,
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // Next auth token rotation
        async jwt({ token, account, user }): Promise<JWT> {
            // First sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token!,
                    refreshToken: account.refresh_token!,
                    username: account.providerAccountId,
                    accessTokenExpires: account.expires_at! * 1000,
                };
            }

            // Return previous token if access token has not expired
            if (Date.now() < token.accessTokenExpires) {
                console.log('Current token is still valid');
                return token;
            }

            // Refresh token if token has expired
            console.log('Refreshing token');
            return await refreshAccessToken(token);
        },

        async session({ session, token }): Promise<Session> {
            session.user.accessToken = token.accessToken;
            session.user.refreshToken = token.refreshToken;
            session.user.username = token.username;

            return session;
        },
    },
});
