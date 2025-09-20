import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { IgniterProvider } from '@igniter-js/core/client'

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vitascience — Analisador de Leads",
  description: "Envie e analise Leads de VSL com integração n8n",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <IgniterProvider>
          {children}
        </IgniterProvider>
      </body>
    </html>
  );
}
