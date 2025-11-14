import { Toaster } from "@/shadcn/components/ui/sonner";
import type { Metadata } from "next";
import { Header } from "./components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "0debt",
  description: "Your financial freedom starts here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/0debt-logo.svg" />
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
