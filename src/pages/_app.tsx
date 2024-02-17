import "@/styles/globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

import firebase from 'firebase/compat/app';
import 'firebase/firestore';
import { FirestoreProvider } from "@/contexts/FirestoreContext";
import { ThemeProvider } from "@mui/material";
import CssBaseline from '@mui/material/CssBaseline';
import theme from "@/theme";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SessionProvider session={session}>
        <FirestoreProvider>
          <Component {...pageProps} />
        </FirestoreProvider>
      </SessionProvider>
    </ThemeProvider >
  )
}

export default MyApp
