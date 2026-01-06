import { Header } from "@/app/components/Header";
import "@/app/globals.css";
import { fetchWithAuth } from "@/app/lib/api";
import { isMockAuthEnabled as isMockEnabled, MOCK_USER } from "@/app/lib/mock-data/auth";
import { getSession } from "@/app/lib/session";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ScrollArea } from "@/shadcn/components/ui/scroll-area";
import { Toaster } from "@/shadcn/components/ui/sonner";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";

import { getDefaultAvatar } from "@/lib/utils";

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
    user = { 
      id: MOCK_USER._id, 
      email: MOCK_USER.email, 
      name: MOCK_USER.name,
      avatar: MOCK_USER.avatar,
      plan: MOCK_USER.plan 
    };
  } else {
    const session = await getSession();
    if (session) {
      try {
        const res = await fetchWithAuth('/users/me', { cache: 'no-store' });
        if (res.ok) {
          const userData = await res.json();
          user = {
            id: userData._id || userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar || getDefaultAvatar(userData._id || userData.id),
            plan: userData.plan
          };
        } else {
          // Fallback to session data if /users/me fails
          user = { 
            id: session.sub, 
            email: session.email, 
            plan: session.plan,
            avatar: getDefaultAvatar(session.sub)
          };
        }
      } catch (error) {
        // Fallback to session data if fetch crashes
        user = { 
          id: session.sub, 
          email: session.email, 
          plan: session.plan,
          avatar: getDefaultAvatar(session.sub)
        };
      }
    }
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
            <div className="flex h-screen flex-col overflow-hidden">
              <Header />
              <ScrollArea className="flex-1 overflow-hidden">
                <main className="view-transition-page">
                  {children}
                </main>
              </ScrollArea>
            </div>
            <Toaster />
          </AuthProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
