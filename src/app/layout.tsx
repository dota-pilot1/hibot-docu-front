import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/widgets/header/ui/Header";
import { Sidebar } from "@/widgets/sidebar";
import { AuthInitializer } from "./AuthInitializer";
import { QueryProvider } from "./QueryProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HiBot Docu",
  description: "Next generation document management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthInitializer>
            <Header />
            <div className="flex pt-12 min-h-screen">
              <Sidebar />
              <main className="flex-1 bg-[#F8F9FA] dark:bg-zinc-950">
                {children}
              </main>
            </div>
          </AuthInitializer>
        </QueryProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
