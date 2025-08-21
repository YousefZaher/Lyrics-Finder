import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lyrics Finder',
  description: 'Find lyrics for your favorite songs instantly.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer style={{
          textAlign: 'center',
          padding: '1rem 0',
          fontSize: '0.8rem',
          color: '#6b7280',
          marginTop: 'auto', // Pushes the footer to the bottom
        }}>
          &copy; {new Date().getFullYear()} Lyrics Finder. All Rights Reserved.
        </footer>
      </body>
    </html>
  );
}