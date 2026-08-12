import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PortfolioAuthProvider } from "@/components/auth/PortfolioAuthProvider";
import { ContactDialogProvider } from "@/components/contact-dialog/ContactDialogProvider";
import { PortfolioProfileProvider } from "@/components/profile/PortfolioProfileProvider";
import { ThemeBootstrap } from "@/components/theme/ThemeBootstrap";
import { ScrollRevealController } from "@/components/ui/ScrollRevealController";
import { buildPageMetadata, defaultSeo, siteUrl } from "@/lib/seo";

import "./globals.css";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: defaultSeo.title,
    description: defaultSeo.description,
    path: "/",
  }),
  metadataBase: new URL(siteUrl),
  applicationName: "Omar Abusahmoud Portfolio",
  authors: [{ name: "Omar Abusahmoud", url: siteUrl }],
  creator: "Omar Abusahmoud",
  publisher: "Omar Abusahmoud",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head />
      <body>
        <ThemeBootstrap />
        <ScrollRevealController />
        <PortfolioAuthProvider>
          <PortfolioProfileProvider>
            <ContactDialogProvider>{children}</ContactDialogProvider>
          </PortfolioProfileProvider>
        </PortfolioAuthProvider>
      </body>
    </html>
  );
}
