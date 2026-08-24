import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Mouv Africa Dashboard",
  description: "Dashboard for the Mouv Africa API collection."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Dashboard />
        {children}
      </body>
    </html>
  );
}
