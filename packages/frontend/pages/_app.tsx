import 'rsuite/dist/rsuite.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app';
import { Provider as NextAuthProvider } from 'next-auth/client';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

axios.defaults.withCredentials = true;

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);

  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Script
        src="https://kit.fontawesome.com/30261c4bad.js"
        crossOrigin="anonymous"
      />
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <NextAuthProvider session={pageProps.session}>
            <Component {...pageProps} />
            <ReactQueryDevtools />
          </NextAuthProvider>
        </Hydrate>
      </QueryClientProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default MyApp;
