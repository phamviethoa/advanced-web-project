<<<<<<< HEAD
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
=======
import Layout from 'components/Layout';

const Home = () => {
  return (
    <Layout>
      <p className="mt-5">Welcome to classroom</p>
    </Layout>
>>>>>>> 3db4dbc983c9c278523e7a12df37c2cc7933c6d5
  );
};

export default Home;
