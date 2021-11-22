import NextAuth from 'next-auth';
import Provider from 'next-auth/providers';

export default NextAuth({
  providers: [
    Provider.Credentials({
      id: 'login',
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'Your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your password',
        },
      },
      async authorize(credentials: Record<string, string>, req) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_GATEWAY}/api/auth/validate-candidate`,
          {
            method: 'POST',
            body: JSON.stringify({
              token: credentials.token,
            }),
            headers: { 'Content-Type': 'application/json' },
          }
        );

        const user = (await res.json()) || {
          id: 1,
          name: 'J Smith',
          email: 'jsmith@example.com',
        };

        if (user) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
});
