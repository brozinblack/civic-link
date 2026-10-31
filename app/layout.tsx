import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";

export const metadata: Metadata = {
  title: {
    default: "Civic Link Uganda — Informed Citizens. Accountable Leadership.",
    template: "%s | Civic Link Uganda",
  },
  description: "Civic news, public accountability and learning for Uganda.",
  applicationName: "Civic Link Uganda",
  openGraph: {
    title: "Civic Link Uganda",
    description: "Informed Citizens. Accountable Leadership. A Better Uganda.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
