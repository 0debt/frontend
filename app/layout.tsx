import { Header } from "@/app/components/Header";
import "@/app/globals.css";
import { isMockEnabled, MOCK_USER } from "@/app/lib/mock";
import { getSession } from "@/app/lib/session";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { Toaster } from "@/shadcn/components/ui/sonner";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";

export const metadata: Metadata = {
  title: "0debt",
  description: "Your financial freedom starts here",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;

  if (isMockEnabled) {
    user = { id: MOCK_USER._id, email: MOCK_USER.email, plan: MOCK_USER.plan };
  } else {
    const session = await getSession();
    user = session ? { id: session.sub, email: session.email, plan: session.plan } : null;
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/0debt-logo.svg" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="d87339d8-de0f-4030-a774-558fb5032c3e"></script>
      </head>
      <body className="antialiased">
        <ViewTransitions>
          <AuthProvider user={user}>
            <ScrollArea className="h-screen">
              <div className="flex min-h-screen flex-col view-transition-page">
                <Header />
                {children}
              </div>
            </ScrollArea>
            <Toaster />
          </AuthProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
