import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { Toaster } from "@/shadcn/components/ui/sonner";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
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
      <head>
        <link rel="icon" href="/0debt-logo.svg" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="d87339d8-de0f-4030-a774-558fb5032c3e"></script>
      </head>
      <body className="antialiased">
        <ViewTransitions>
          <ScrollArea className="h-screen">
            <div className="flex min-h-screen flex-col view-transition-page">
              <Header />
              {children}
            </div>
          </ScrollArea>
          <Toaster />
        </ViewTransitions>
      </body>
    </html>
  );
}
