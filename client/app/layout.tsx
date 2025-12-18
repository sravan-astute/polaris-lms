import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 👇 Make sure this points to the ClientLayout wrapper
import ClientLayout from "./components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Polaris",
  description: "Next Gen Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}