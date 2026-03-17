import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "../context/socketContext";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public',
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '600', '800'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: "Mesh - Invent, Create, Share",
  description: "Mesh - next generation social network",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  return (
    <html lang="en" className={`dark ${publicSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background-dark text-slate-100 min-h-screen antialiased">
        {/* Material Symbols */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
        <SocketProvider token={token}>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
