import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusSearch - Decentralized Web Gateway',
  description: 'A lightning fast, Google-UX inspired bridge search engine for the decentralized web.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body class="bg-[#080B12] antialiased">
        {children}
      </body>
    </html>
  );
}
