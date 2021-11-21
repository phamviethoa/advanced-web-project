import React from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/client';

const Home = () => {
  const [session, loading] = useSession();

  if (session) {
    console.log(session);
  } else {
    console.log('You are not sign in');
  }

  const login = () =>
    signIn('login', {
      name: 'J Smith',
      email: 'jsmith@example.com',
    });

  return (
    <div>
      <button onClick={login}>Sign In</button>
      <button>Sing out</button>
    </div>
  );
};

export default Home;
