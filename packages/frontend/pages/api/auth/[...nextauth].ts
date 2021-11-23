import NextAuth from 'next-auth';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export default NextAuth({
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      id: 'login',
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Your Email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your Password',
        },
      },
      async authorize(credentials: Record<string, string>, req: any) {
        const { username, password } = credentials;

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/validate`,
          {
            username,
            password,
          }
        );

        const user = res.data;

        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});
