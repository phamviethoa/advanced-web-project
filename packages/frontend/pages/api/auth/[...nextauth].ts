import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';
//import FacebookProvider from 'next-auth/providers/facebook';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import jwt from 'jsonwebtoken';

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
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'Your Email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your Password',
        },
      },
      async authorize(credentials: Record<string, string>) {
        const { email, password } = credentials;

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/validate`,
          {
            username: email,
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

  secret: 'secret',
  session: {
    jwt: true,
    maxAge: 1 * 24 * 60 * 60, // 1 day in seconds
  },
  callbacks: {
    redirect(url) {
      return url;
    },
    signIn() {
      return true;
    },
    jwt(payload, user) {
      if (user) {
        if (!user.name) {
          user.name = user.fullName as string;
          delete user.fullName;
        }
        Object.assign(payload, user);
      }
      return payload;
    },
    session: async (session, user) => {
      Object.assign(session.user, user);
      return Promise.resolve(session);
    },
  },
  jwt: {
    secret: 'secret',
    encode: async (params) => {
      const secret = params?.secret || '';
      const token = params?.token as JWT;

      const payload = Object.assign({}, token);

      const encodedToken = jwt.sign(payload, secret, {
        algorithm: 'HS256',
      });

      return encodedToken;
    },

    decode: async (params) => {
      if (!params?.token) {
        return {};
      }

      const secret = params?.secret as string;
      const decodedToken = jwt.verify(params?.token, secret, {
        algorithms: ['HS256'],
      }) as JWT;

      return decodedToken;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: `/auth/error`,
  },
  events: {},
  debug: false,
});
