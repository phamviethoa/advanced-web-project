<<<<<<< HEAD
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'next-auth/client';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
=======
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider as NextAuthProvider } from 'next-auth/client';
import Script from 'next/script';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  return (
    <>
      <Script
        src="https://kit.fontawesome.com/30261c4bad.js"
        crossOrigin="anonymous"
      />
      <NextAuthProvider session={pageProps.session}>
        <Component {...pageProps} />
      </NextAuthProvider>
    </>
>>>>>>> 3db4dbc983c9c278523e7a12df37c2cc7933c6d5
  );
}

export default MyApp;
