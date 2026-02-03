import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/widgets/header/ui/Header";
import { ResizableLayout } from "@/widgets/sidebar";
import { AuthInitializer } from "./AuthInitializer";
import { QueryProvider } from "./QueryProvider";
import { FooterWrapper } from "@/widgets/footer";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallback } from "@/shared/ui/ErrorBoundaryFallback";

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
            <div className="flex pt-10 h-screen pb-14">
              <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
                <ResizableLayout>{children}</ResizableLayout>
              </ErrorBoundary>
            </div>
            <FooterWrapper />
          </AuthInitializer>
        </QueryProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
