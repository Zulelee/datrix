import './globals.css';
import type { Metadata } from 'next';
import LoadingScreen from '@/components/LoadingScreen';

export const metadata: Metadata = {
  title: 'Datrix - AI-Powered Data Harmony',
  description: 'Organize chaos. Datrix turns scattered files and emails into clean, visual dashboards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-ibm-plex">
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}