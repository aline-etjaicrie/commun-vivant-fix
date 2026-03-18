import type { AppProps } from 'next/app';

// Keeps the Pages Router manifest available for Next.js build tooling.
export default function LegacyPagesApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
